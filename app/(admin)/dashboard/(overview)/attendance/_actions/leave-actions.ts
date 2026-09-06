// @/app/(admin)/dashboard/(overview)/attendance/_actions/leave-actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateLeaveRequestStatus(
  requestId: string,
  newStatus: "Approved" | "Rejected",
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    if (!requestId) return { success: false, error: "Request ID is required." };

    const isAdmin = session.user.role === "admin";
 
    const managerName = session.user.name as string;
 
    if (!isAdmin) {
      const authCheck = await db`
        SELECT r.id FROM leave_requests r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ${requestId} AND u.manager_name = ${managerName}
      `;
      if (authCheck.length === 0) {
        return {
          success: false,
          error: "Unauthorized to modify this request.",
        };
      }
    }

    await db`
      UPDATE leave_requests
      SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${requestId}
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error(`[LEAVE_ACTION_ERROR]`, error);
    return { success: false, error: "Failed to update leave request." };
  }
}
