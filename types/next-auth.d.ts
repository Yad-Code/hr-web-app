// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // 1. Extend the User object (returned from authorize/database)
  interface User extends DefaultUser {
    role?: "admin" | "employee";
  }

  // 2. Extend the Session object (available via auth() and useSession())
  interface Session {
    user: {
      role?: "admin" | "employee";
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT object (passed between jwt and session callbacks)
  interface JWT {
    role?: "admin" | "employee";
    id?: string;
  }
}