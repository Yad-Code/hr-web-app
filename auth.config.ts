// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Pass the role from the database user object into the JWT token
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the role from the JWT token down to the client session
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;

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