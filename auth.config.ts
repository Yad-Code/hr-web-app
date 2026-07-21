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
      const path = nextUrl.pathname;

      const isOnAdminRoute = path.startsWith("/dashboard");
      // Clean check: /my-profile covers both /my-profile and /my-profile/my-attendance
      const isOnEmployeePortal = path.startsWith("/my-profile");
      const isOnLoginPage = path.startsWith("/login");

      // 1. Unauthenticated users trying to access protected pages
      if ((isOnAdminRoute || isOnEmployeePortal) && !isLoggedIn) {
        return false; // Automatically redirects to /login
      }

      // 2. Handle Logged-in users visiting /login or root /
      if (isLoggedIn && (isOnLoginPage || path === "/")) {
        const target = userRole === "admin" ? "/dashboard" : "/my-profile";
        return Response.redirect(new URL(target, nextUrl));
      }

      // 3. Admin-only protection (Block employees from /dashboard and /employees)
      if (isOnAdminRoute && userRole === "employee") {
        return Response.redirect(new URL("/my-profile", nextUrl));
      }

      // 4. Employee-only protection (Block admins from /my-profile and nested routes)
      if (isOnEmployeePortal && userRole === "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;