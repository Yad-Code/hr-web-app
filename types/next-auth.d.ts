import NextAuth, { type DefaultSession, type User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string; // Appends role property directly onto the standard database User model
  }

  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string; // Appends role directly to JWT objects
  }
}