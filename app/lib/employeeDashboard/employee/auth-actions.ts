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
    return userResult[0];
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
    // 👇 Provide only strict identity fields, no booleans
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image_url,
    };
  }

  return null;
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

export async function authenticate(
  _prevState: string | undefined,
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

    if (!user) {
      return "Invalid credentials.";
    }

    const dashCheck = await sql`
      SELECT 1 FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = ${user.id}::uuid AND p.action = 'view_dashboard'
      LIMIT 1
    `;

    const canViewDashboard = dashCheck.length > 0;
    const destination = canViewDashboard ? "/dashboard" : "/my-profile";

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
