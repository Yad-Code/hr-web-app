"use server";

import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

export async function markFeedbackAsRead(feedbackId: string) {
  try {
    const userId = await getCurrentUserId();
 
    await sql`
      UPDATE user_feedback
      SET is_read = true
      WHERE id = ${feedbackId} AND user_id = ${userId}
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark feedback as read:", error);
    return { success: false, error: "Could not update feedback status." };
  }
}

export async function markAllFeedbackAsRead() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "User session not found." };
    }

    await sql`
      UPDATE user_feedback
      SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all feedback as read:", error);
    return { success: false, error: "Could not mark all items as read." };
  }
}

export async function requestFeedback(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const recipient = formData.get("recipient") as string;
    const type = formData.get("type") as string;
    const message = formData.get("message") as string;

    if (!userId) {
      return { success: false, error: "User session not found." };
    }

    if (!recipient || !message) {
      return { success: false, error: "Recipient and message are required." };
    }
 
    const recipientResult = await sql`
        SELECT id, name FROM users 
        WHERE email = ${recipient}
        LIMIT 1
      `;
 
    const recipientUser = recipientResult[0];

    if (!recipientUser) {
      console.error(`Recipient "${recipient}" not found in users table.`);
      return {
        success: false,
        error: `Recipient "${recipient}" could not be found.`,
      };
    }

    // 2. Fetch requester info
    const senderResult = await sql`
      SELECT name FROM users WHERE id = ${userId} LIMIT 1
    `;
    const senderName = senderResult[0]?.name || "A team member";

    // 3. Insert notification linked directly to recipient's ID
    const title = `Feedback Request from ${senderName}`;
    const description = `Requested feedback on ${type}: "${message}"`;

    await sql`
      INSERT INTO performance_notifications (
        user_id,
        title,
        description,
        type,
        is_read
      )
      VALUES (
        ${recipientUser.id},
        ${title},
        ${description},
        'Feedback Request',
        false
      )
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to request feedback:", error);
    return {
      success: false,
      error: "Database error while processing request.",
    };
  }
}
