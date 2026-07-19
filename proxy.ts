import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Matches all request paths except API routes, static assets, and images
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};