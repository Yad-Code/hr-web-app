// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dynamic server-side execution import to cleanly bypass Edge runtime layout crashes
        const { verifyUserCredentials } = await import("@/app/lib/auth-actions");
        
        return await verifyUserCredentials(
          credentials.email as string, 
          credentials.password as string
        );
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});