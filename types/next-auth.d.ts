// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: "admin" | "manager" | "employee";
  }

  interface Session {
    user: {
      role?: "admin" | "manager" | "employee";
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "manager" | "employee";
    id?: string;
  }
}
