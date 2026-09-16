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
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    if (!requestId) return { success: false, error: "Request ID is required." };

    const isAdmin = session.user.isAdmin;
    const canApproveLeaves = session.user.canApproveLeaves;
    const managerId = session.user.id;

    if (!isAdmin && !canApproveLeaves) {
      return { success: false, error: "Unauthorized to approve leaves." };
    }

    const requestData = await db`
      SELECT r.*, u.manager_id  
      FROM leave_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${requestId}
    `;

    if (requestData.length === 0)
      return { success: false, error: "Request not found." };
    const request = requestData[0];

    if (!isAdmin && request.manager_id !== managerId) {
      return {
        success: false,
        error: "Unauthorized to modify this employee's request.",
      };
    }

    await db`
      UPDATE leave_requests
      SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${requestId}
    `;

    if (newStatus === "Approved") {
      const userId = request.user_id;

      if (request.type === "dayoff") {
        const days = Number(request.total_days);
        if (request.leave_category?.toLowerCase() === "sick") {
          await db`UPDATE leave_balances SET sick_remaining = sick_remaining - ${days} WHERE user_id = ${userId}`;
        } else {
          await db`UPDATE leave_balances SET annual_remaining = annual_remaining - ${days} WHERE user_id = ${userId}`;
        }
      } else if (request.type === "timeoff") {
        const hours = Number(request.hours);
        await db`UPDATE leave_balances SET monthly_remaining_hours = monthly_remaining_hours - ${hours} WHERE user_id = ${userId}`;
      }
    }

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error(`[LEAVE_ACTION_ERROR]`, error);
    return { success: false, error: "Failed to update leave request." };
  }
}
