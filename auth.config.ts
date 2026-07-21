// auth.config.ts
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
        session.user.role = token.role as "admin" | "employee";
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProfile = nextUrl.pathname.startsWith("/my-profile") || nextUrl.pathname.startsWith("/my-attendance");
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");

      // 1. Unauthenticated users trying to access protected pages
      if ((isOnDashboard || isOnProfile) && !isLoggedIn) {
        return false; // Automatically redirects to /login
      }

      // 2. Role-based protection for Admin Dashboard only
      if (isOnDashboard && userRole !== "admin") {
        return Response.redirect(new URL("/my-profile", nextUrl));
      }

      // 3. Logged-in users visiting /login or root /
      if (isLoggedIn && (isOnLoginPage || nextUrl.pathname === "/")) {
        const target = userRole === "admin" ? "/dashboard" : "/my-profile";
        return Response.redirect(new URL(target, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;