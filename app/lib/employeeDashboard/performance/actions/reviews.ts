// app/lib/performance/actions/reviews.ts
"use server";

import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

export async function updateEmployeeComments(
  reviewId: string,
  comments: string,
) {
  try {
    const userId = await getCurrentUserId();

    await sql`
      UPDATE performance_reviews
      SET employee_comments = ${comments}
      WHERE id = ${reviewId} AND user_id = ${userId}
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update employee comments:", error);
    return { success: false, error: "Failed to save comments." };
  }
}

export async function acknowledgeReview(reviewId: string) {
  try {
    const userId = await getCurrentUserId();

    await sql`
      UPDATE performance_reviews
      SET 
        acknowledged = true,
        acknowledged_at = NOW()
      WHERE id = ${reviewId} AND user_id = ${userId}
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to acknowledge review:", error);
    return { success: false, error: "Failed to process acknowledgment." };
  }
}
