// @/app/lib/employeeDashboard/employee/auth-actions.ts
"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcrypt";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

async function getUser(email: string) {
  try { 
    const userResult = await sql`
      SELECT id, name, email, password_hash, role, image_url
      FROM users 
      WHERE email=${email}
    `;

    if (userResult.length === 0) return null;
    const user = userResult[0];
 
    const perms = await sql`
      SELECT p.action 
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${user.id}
    `;
 
    const actions = perms.map((p) => p.action);
 
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role,
      image_url: user.image_url,
      // Derive boolean flags from the new role and permission tables
      isAdmin: user.role === "admin",
      isManager:
        user.role === "manager" || user.role === "hr" || user.role === "admin",
      hasEmployeeView: true,
      canEditProfile: true,
      canStartReviews: actions.includes("start_reviews"),
      canLogFeedback: actions.includes("log_feedback"),
      canApproveLeaves: actions.includes("approve_leaves"),
    };
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
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

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
