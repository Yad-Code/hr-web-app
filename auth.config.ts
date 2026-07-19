import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // TypeScript now safely knows user.role exists naturally!
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // TypeScript safely maps token.role onto the session object structure
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role; // Clean, error-free typing

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProfile = nextUrl.pathname.startsWith("/my-profile");
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");

      // 1. If trying to access protected areas
      if (isOnDashboard || isOnProfile) {
        if (!isLoggedIn) return false; // Redirect to login

        // Role enforcement
        if (isOnDashboard && userRole !== "admin") {
          return Response.redirect(new URL("/my-profile", nextUrl));
        }
        if (isOnProfile && userRole !== "employee") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // 2. If logged in and visiting home page or login page, auto-route them out
      if (isLoggedIn && (isOnLoginPage || nextUrl.pathname === "/")) {
        if (userRole === "admin") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return Response.redirect(new URL("/my-profile", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Core providers are initialized in auth.ts
} satisfies NextAuthConfig;