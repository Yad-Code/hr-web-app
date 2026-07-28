"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

export async function markFeedbackAsRead(
  feedbackId: string
) {
  const userId = await getCurrentUserId();

  await sql`
    UPDATE user_feedback
    SET is_read = TRUE
    WHERE
      id = ${feedbackId}
      AND user_id = ${userId}
  `;

  revalidatePath("/my-profile/performance");

  return {
    success: true,
  };
}