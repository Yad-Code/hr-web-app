import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    isAdmin: boolean;
    isManager: boolean;
    hasEmployeeView: boolean;
    canEditProfile: boolean;
    canStartReviews: boolean;
    canLogFeedback: boolean;
    canApproveLeaves: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      isAdmin: boolean;
      isManager: boolean;
      hasEmployeeView: boolean;
      canEditProfile: boolean;
      canStartReviews: boolean;
      canLogFeedback: boolean;
      canApproveLeaves: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    isAdmin: boolean;
    isManager: boolean;
    hasEmployeeView: boolean;
    canEditProfile: boolean;
    canStartReviews: boolean;
    canLogFeedback: boolean;
    canApproveLeaves: boolean;
  }
}
