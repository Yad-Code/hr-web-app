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
      const user = auth?.user;
      const path = nextUrl.pathname;

      const isOnAdminRoute = path.startsWith("/dashboard");
      const isOnEmployeePortal = path.startsWith("/my-profile");
      const isOnLoginPage = path.startsWith("/login");

      // 1. Unauthenticated users trying to access protected pages
      if ((isOnAdminRoute || isOnEmployeePortal) && !isLoggedIn) {
        return false;
      }

      const isManagement = user?.role === "admin" || user?.role === "manager";

      // 2. Handle Logged-in users visiting /login or root /
      if (isLoggedIn && (isOnLoginPage || path === "/")) {
        const target = isManagement ? "/dashboard" : "/my-profile";
        return Response.redirect(new URL(target, nextUrl));
      }

      // 3. Admin/Manager protection: Block standard employees from /dashboard
      if (isOnAdminRoute && !isManagement) {
        return Response.redirect(new URL("/my-profile", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
