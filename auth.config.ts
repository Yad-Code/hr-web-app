import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isOnProtectedPage =
        path.startsWith("/dashboard") || path.startsWith("/my-profile");
      const isOnLoginPage = path.startsWith("/login");

      // 1. Kick out unauthenticated users trying to access protected pages
      if (isOnProtectedPage && !isLoggedIn) {
        return false;
      }

      // 2. If already logged in and visiting root or login, bounce them to their profile.
      // (The actual login form submission handles the smart dashboard routing)
      if (isLoggedIn && (isOnLoginPage || path === "/")) {
        return Response.redirect(new URL("/my-profile", nextUrl));
      }
 
      // We now let the individual page layouts query the database to verify access.
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
