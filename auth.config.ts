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
        session.user.role = token.role as "admin" | "manager" | "employee";
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const path = nextUrl.pathname;

      const isOnAdminRoute = path.startsWith("/dashboard");
      const isOnEmployeePortal = path.startsWith("/my-profile");
      const isOnLoginPage = path.startsWith("/login");

      // 1. Unauthenticated users trying to access protected pages
      if ((isOnAdminRoute || isOnEmployeePortal) && !isLoggedIn) {
        return false;
      }

      // 2. Handle Logged-in users visiting /login or root /
      if (isLoggedIn && (isOnLoginPage || path === "/")) {
        const target =
          userRole === "admin" || userRole === "manager"
            ? "/dashboard"
            : "/my-profile";
        return Response.redirect(new URL(target, nextUrl));
      }

      // 3. Admin/Manager protection: Block standard employees from /dashboard
      if (isOnAdminRoute && userRole === "employee") {
        return Response.redirect(new URL("/my-profile", nextUrl));
      }

      // 4. Employee portal protection: Block ONLY Admins. Managers are allowed through!
      if (isOnEmployeePortal && userRole === "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
