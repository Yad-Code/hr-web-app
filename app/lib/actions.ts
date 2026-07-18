// app/lib/actions.ts
"use server";

import { signIn } from "@/app/auth";
import { AuthError } from "next-auth";

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password credentials.";
        default:
          return "Something went wrong. Please try again.";
      }
    }
    throw error;
  }
}