// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
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
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          // FIX: Changed from user.passwordHash to user.password_hash to match table setup
          const passwordsMatch = await bcrypt.compare(password, user.password_hash);

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role, // Passed forward to the jwt callback
            };
          }
        }
        return null;
      },
    }),
  ],
});