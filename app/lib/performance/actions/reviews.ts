"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

export async function updateEmployeeComments(
  reviewId: string,
  comments: string
) {
  const userId = await getCurrentUserId();

  await sql`
    UPDATE performance_reviews
    SET employee_comments = ${comments}
    WHERE
      id = ${reviewId}
      AND user_id = ${userId}
  `;

  revalidatePath("/my-profile/performance");
 
  return {
    success: true,
  };
}