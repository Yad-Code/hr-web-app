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

        const { verifyUserCredentials } =
          await import("@/app/lib/employeeDashboard/employee/auth-actions");

        return await verifyUserCredentials(
          credentials.email as string,
          credentials.password as string,
        );
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
        token.role = user.role;
      }

      // Handle manual session updates (when user changes profile pic)
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as "admin" | "manager" | "employee"; // <-- Added manager
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
