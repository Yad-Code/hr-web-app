"use server";

import { auth } from "@/auth";

/**
 * Returns the authenticated user's UUID.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}
