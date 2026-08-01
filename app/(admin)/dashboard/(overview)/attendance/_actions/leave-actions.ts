"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

export async function updateLeaveRequestStatus(
  requestId: string,
  newStatus: "Approved" | "Rejected"
) {
  try {
    if (!requestId) {
      return { success: false, error: "Request ID is required." };
    }

    // Execute the database mutation.
    // NOTE: Ensure 'leave_requests' matches your exact PostgreSQL table name.
    await db`
      UPDATE leave_requests
      SET 
        status = ${newStatus},
        updated_at = NOW()
      WHERE id = ${requestId}
    `;

    // Purge the cache for the attendance page so it fetches fresh data
    revalidatePath("/dashboard/attendance");

    return { success: true };
  } catch (error) {
    console.error(`[LEAVE_ACTION_ERROR] Failed to update request ${requestId}:`, error);
    return { 
      success: false, 
      error: "Failed to update leave request. Please try again." 
    };
  }
}