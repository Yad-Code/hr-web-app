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
    const user = await sql`SELECT id, name, email, password_hash, role FROM users WHERE email=${email}`;
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

  const passwordsMatch = await bcrypt.compare(cleanPassword, user.password_hash);

  if (passwordsMatch) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

    // Fetch user role first to determine correct post-login landing page
    const user = await getUser(email);
    const destination = user?.role === "admin" ? "/dashboard" : "/my-profile";

    await signIn("credentials", {
      email,
      password,
      redirectTo: destination, // Direct explicitly to break the default '/' loop
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials. Please check your email and password.";
        default:
          return "Something went wrong. Please try again.";
      }
    }

    throw error;
  }
}