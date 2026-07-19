"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

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