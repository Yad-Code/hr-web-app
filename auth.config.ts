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
        token.isAdmin = user.isAdmin;
        token.isManager = user.isManager;
        token.hasEmployeeView = user.hasEmployeeView;
        token.canEditProfile = user.canEditProfile;
        token.canStartReviews = user.canStartReviews;
        token.canLogFeedback = user.canLogFeedback;
        token.canApproveLeaves = user.canApproveLeaves;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        // Expose permissions to the client and server components
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isManager = token.isManager as boolean;
        session.user.hasEmployeeView = token.hasEmployeeView as boolean;
        session.user.canEditProfile = token.canEditProfile as boolean;
        session.user.canStartReviews = token.canStartReviews as boolean;
        session.user.canLogFeedback = token.canLogFeedback as boolean;
        session.user.canApproveLeaves = token.canApproveLeaves as boolean;
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

      // 2. Handle Logged-in users visiting /login or root /
      if (isLoggedIn && (isOnLoginPage || path === "/")) {
        const target =
          user?.isAdmin || user?.isManager ? "/dashboard" : "/my-profile";
        return Response.redirect(new URL(target, nextUrl));
      }

      // 3. Admin/Manager protection: Block standard employees from /dashboard
      if (isOnAdminRoute && !user?.isAdmin && !user?.isManager) {
        return Response.redirect(new URL("/my-profile", nextUrl));
      }

      // 4. Employee portal protection: Block users who shouldn't have an employee view (e.g., strict Admins)
      if (isOnEmployeePortal && !user?.hasEmployeeView) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
