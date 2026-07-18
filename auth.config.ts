import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  providers: [
    // Leave providers array empty or just provide a minimal layout here
    // We will expand credentials authentication securely in the server-only file
    Credentials({}), 
  ],
} satisfies NextAuthConfig;