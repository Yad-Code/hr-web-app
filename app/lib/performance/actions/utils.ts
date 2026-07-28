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

export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);

  // Use UTC to prevent local timezone offsets from shifting dates back by 1 day
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}