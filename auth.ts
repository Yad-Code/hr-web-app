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
        // Inject new granular permissions
        token.isAdmin = user.isAdmin;
        token.isManager = user.isManager;
        token.hasEmployeeView = user.hasEmployeeView;
        token.canEditProfile = user.canEditProfile;
        token.canStartReviews = user.canStartReviews;
        token.canLogFeedback = user.canLogFeedback;
        token.canApproveLeaves = user.canApproveLeaves;
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
        session.user.role = token.role as string;
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
  },
  secret: process.env.AUTH_SECRET,
});
