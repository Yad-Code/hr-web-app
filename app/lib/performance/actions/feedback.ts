"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

export async function markFeedbackAsRead(feedbackId: string) {
  try {
    await sql`
      UPDATE user_feedback
      SET is_read = true
      WHERE id = ${feedbackId}
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark feedback as read:", error);
    return { success: false };
  }
}

export async function markAllFeedbackAsRead() {
  try {
    const userId = await getCurrentUserId(); // Ensure this fetches current user ID

    await sql`
      UPDATE user_feedback
      SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all feedback as read:", error);
    return { success: false };
  }
}

export async function requestFeedback(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const recipient = formData.get("recipient") as string;
    const type = formData.get("type") as string;
    const message = formData.get("message") as string;

    // Create a notification for the recipient (or manager) asking for feedback
    await sql`
      INSERT INTO performance_notifications (
        user_id,
        title,
        description,
        type,
        is_read
      )
      VALUES (
        (SELECT id FROM users WHERE email = ${recipient} OR name = ${recipient} LIMIT 1),
        ${`Feedback Request from team member`},
        ${`Requested feedback on ${type}: "${message}"`},
        'Feedback Request',
        false
      )
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to request feedback:", error);
    return { success: false };
  }
}
