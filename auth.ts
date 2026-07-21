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
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial sign-in: transfer user data to token
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }

      // 2. Fetch fresh image URL from Postgres whenever token/session updates
      if (token.email) {
        try {
          const { sql } = await import("@/app/lib/db");
          const [dbUser] = await sql`
            SELECT id, image_url FROM users WHERE email = ${token.email}
          `;
          if (dbUser) {
            token.id = dbUser.id;
            token.picture = dbUser.image_url;
          }
        } catch (error) {
          console.error("Failed to fetch fresh user image for JWT:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Pass the updated image and ID from JWT token to the client session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});