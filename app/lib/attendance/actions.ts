"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAccess } from "@/app/lib/auth/access-control";

export async function overrideAttendanceRecord(formData: FormData) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return { success: false, error: "Unauthorized." };

    const recordId = formData.get("recordId") as string;
    const targetDate = formData.get("targetDate") as string;
    const status = formData.get("status") as string;
    const rawCheckIn = formData.get("checkInTime") as string;
    const rawCheckOut = formData.get("checkOutTime") as string;

    if (!recordId) return { success: false, error: "Record ID is missing." };

    // Determine target User ID
    let targetUserId = "";
    if (recordId.startsWith("pending-")) {
      targetUserId = recordId.replace("pending-", "");
    } else {
      const rec =
        await db`SELECT user_id FROM attendance WHERE id = ${recordId}`;
      if (rec.length > 0) targetUserId = rec[0].user_id as string;
    }

    // 👇 Dynamic Security Check: Can they update records for this specific user?
    const isAuthorized = await verifyAccess(
      actorId,
      "update_records",
      targetUserId,
    );
    if (!isAuthorized)
      return {
        success: false,
        error: "Forbidden: You lack permission to override this record.",
      };

    const formatTo12Hr = (time24: string) => {
      if (!time24) return null;
      const [h, m] = time24.split(":");
      const hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
    };

    const checkInTime = formatTo12Hr(rawCheckIn) || null;
    const checkOutTime = formatTo12Hr(rawCheckOut) || null;

    let workHours: string | null = null;
    if (rawCheckIn && rawCheckOut) {
      const [inHours, inMinutes] = rawCheckIn.split(":").map(Number);
      const [outHours, outMinutes] = rawCheckOut.split(":").map(Number);
      let diffMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      workHours =
        `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60 > 0 ? `${diffMinutes % 60}m` : ""}`.trim();
    }

    if (recordId.startsWith("pending-")) {
      await db`
        INSERT INTO attendance (user_id, date, check_in, check_out, work_hours, status, work_location)
        VALUES (${targetUserId}::uuid, ${targetDate}, ${checkInTime}, ${checkOutTime}, ${workHours}, ${status}, 'Office')
      `;
    } else {
      await db`
        UPDATE attendance
        SET status = ${status}, check_in = ${checkInTime}, check_out = ${checkOutTime}, work_hours = ${workHours}
        WHERE id = ${recordId}::uuid
      `;
    }

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("[ATTENDANCE_OVERRIDE_ERROR]", error);
    return { success: false, error: "Failed to update attendance record." };
  }
}

export async function createShiftRule(formData: FormData) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return { success: false, error: "Unauthorized." };

    // 👇 Dynamic Security Check: Creating global shifts requires System Security access
    const isAuthorized = await verifyAccess(
      actorId,
      "manage_security_policies",
      actorId,
    );
    if (!isAuthorized)
      return {
        success: false,
        error:
          "Forbidden: Only System Administrators can create global shift rules.",
      };

    const shiftName = formData.get("shiftName") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const gracePeriod = Number(formData.get("gracePeriod")) || 15;

    if (!shiftName || !startTime || !endTime)
      return { success: false, error: "All fields required." };

    await db`
      INSERT INTO shift_rules (shift_name, start_time, end_time, grace_period_minutes)
      VALUES (${shiftName}, ${startTime}, ${endTime}, ${gracePeriod})
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("[SHIFT_RULE_ERROR]", error);
    return { success: false, error: "Failed to create shift rule." };
  }
}

export async function assignEmployeeShift(formData: FormData) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return { success: false, error: "Unauthorized." };

    const employeeId = formData.get("employeeId") as string;
    const shiftRuleId = formData.get("shiftRuleId") as string;

    if (!employeeId || !shiftRuleId)
      return { success: false, error: "Employee and Shift Rule are required." };

    // 👇 Dynamic Security Check: Can they update records for this specific user?
    const isAuthorized = await verifyAccess(
      actorId,
      "update_records",
      employeeId,
    );
    if (!isAuthorized)
      return {
        success: false,
        error:
          "Forbidden: You lack permission to assign shifts to this employee.",
      };

    const shiftData =
      await db`SELECT shift_name, start_time, end_time FROM shift_rules WHERE id = ${shiftRuleId}::uuid`;
    if (!shiftData.length)
      return { success: false, error: "Shift rule not found." };

    const shiftName = shiftData[0].shift_name as string;
    const startTime = shiftData[0].start_time as string;
    const endTime = shiftData[0].end_time as string;

    await db`
      UPDATE users 
      SET shift_type = ${shiftName}, shift_start = ${startTime}, shift_end = ${endTime}
      WHERE id = ${employeeId}::uuid
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("[ASSIGN_SHIFT_ERROR]", error);
    return { success: false, error: "Failed to assign shift to employee." };
  }
}

export async function updateLeaveRequestStatus(
  requestId: string,
  newStatus: "Approved" | "Rejected",
) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return { success: false, error: "Unauthorized" };
    if (!requestId) return { success: false, error: "Request ID is required." };

    const requestData =
      await db`SELECT user_id, type, total_days, leave_category, hours FROM leave_requests WHERE id = ${requestId}::uuid`;
    if (requestData.length === 0)
      return { success: false, error: "Request not found." };

    const request = requestData[0];
    const targetUserId = request.user_id as string;

    // 👇 Dynamic Security Check: Can they approve leaves for this specific user?
    const isAuthorized = await verifyAccess(
      actorId,
      "approve_leaves",
      targetUserId,
    );
    if (!isAuthorized)
      return {
        success: false,
        error:
          "Forbidden: You lack permission to modify this employee's request.",
      };

    await db`UPDATE leave_requests SET status = ${newStatus}, updated_at = NOW() WHERE id = ${requestId}::uuid`;

    if (newStatus === "Approved") {
      if (request.type === "dayoff") {
        const days = Number(request.total_days);
        if (request.leave_category?.toLowerCase() === "sick") {
          await db`UPDATE leave_balances SET sick_remaining = sick_remaining - ${days} WHERE user_id = ${targetUserId}::uuid`;
        } else {
          await db`UPDATE leave_balances SET annual_remaining = annual_remaining - ${days} WHERE user_id = ${targetUserId}::uuid`;
        }
      } else if (request.type === "timeoff") {
        const hours = Number(request.hours);
        await db`UPDATE leave_balances SET monthly_remaining_hours = monthly_remaining_hours - ${hours} WHERE user_id = ${targetUserId}::uuid`;
      }
    }

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error(`[LEAVE_ACTION_ERROR]`, error);
    return { success: false, error: "Failed to update leave request." };
  }
}
