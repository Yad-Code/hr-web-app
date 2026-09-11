"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcrypt";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// ==========================================
// SCHEMAS & HELPERS
// ==========================================

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

async function getUser(email: string) {
  try {
    // UPDATED: Fetch the new granular boolean flags
    const user = await sql`
      SELECT 
        id, name, email, password_hash, role, image_url,
        is_admin AS "isAdmin", 
        is_manager AS "isManager", 
        has_employee_view AS "hasEmployeeView",
        can_edit_profile AS "canEditProfile",
        can_start_reviews AS "canStartReviews",
        can_log_feedback AS "canLogFeedback",
        can_approve_leaves AS "canApproveLeaves"
      FROM users 
      WHERE email=${email}
    `;
    return user[0];
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
}

export async function verifyUserCredentials(email: string, password: string) {
  const parsedCredentials = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .safeParse({ email, password });

  if (!parsedCredentials.success) return null;

  const { email: cleanEmail, password: cleanPassword } = parsedCredentials.data;
  const user = await getUser(cleanEmail);
  if (!user) return null;

  const passwordsMatch = await bcrypt.compare(
    cleanPassword,
    user.password_hash,
  );

  if (passwordsMatch) {
    // UPDATED: Return the booleans to NextAuth so they can be injected into the session token
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // Cosmetic title
      image: user.image_url,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
      hasEmployeeView: user.hasEmployeeView,
      canEditProfile: user.canEditProfile,
      canStartReviews: user.canStartReviews,
      canLogFeedback: user.canLogFeedback,
      canApproveLeaves: user.canApproveLeaves,
    };
  }

  return null;
}

// ==========================================
// AUTHENTICATION SERVER ACTIONS
// ==========================================

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

/**
 * Server Action to securely authenticate users.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const rawFields = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(rawFields);

    if (!validatedFields.success) {
      return "Invalid email or password structure.";
    }

    const { email, password } = validatedFields.data;

    // UPDATED: Redirect logic now uses absolute structural flags instead of cosmetic strings
    const user = await getUser(email);
    const destination =
      user?.isAdmin || user?.isManager ? "/dashboard" : "/my-profile";

    await signIn("credentials", {
      email,
      password,
      redirectTo: destination,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
