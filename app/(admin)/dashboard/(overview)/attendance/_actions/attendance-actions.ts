// @/app/(admin)/dashboard/(overview)/attendance/_actions/attendance-actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Helper for Manager Authorization Check
async function authorizeManagerAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) return false;
  if (session.user.role === "admin") return true;
  if (session.user.role === "manager") {
    // STRICT TYPING: Cast manager name as string
    const managerName = session.user.name as string;
    const check =
      await db`SELECT id FROM users WHERE id = ${targetUserId} AND manager_name = ${managerName}`;
    return check.length > 0;
  }
  return false;
}

export async function overrideAttendanceRecord(formData: FormData) {
  try {
    const recordId = formData.get("recordId") as string;
    const targetDate = formData.get("targetDate") as string;
    const status = formData.get("status") as string;
    const rawCheckIn = formData.get("checkInTime") as string;
    const rawCheckOut = formData.get("checkOutTime") as string;

    if (!recordId) return { success: false, error: "Record ID is missing." };

    // Determine target User ID for authorization
    let targetUserId = "";
    if (recordId.startsWith("pending-")) {
      targetUserId = recordId.replace("pending-", "");
    } else {
      const rec =
        await db`SELECT user_id FROM attendance WHERE id = ${recordId}`;
      if (rec.length > 0) targetUserId = rec[0].user_id as string; // STRICT TYPING
    }

    // SECURITY CHECK
    const isAuthorized = await authorizeManagerAction(targetUserId);
    if (!isAuthorized)
      return { success: false, error: "Unauthorized to edit this employee." };

    const formatTo12Hr = (time24: string) => {
      if (!time24) return null;
      const [h, m] = time24.split(":");
      const hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
    };

    // STRICT TYPING: Fallback to null instead of undefined
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
        VALUES (${targetUserId}, ${targetDate}, ${checkInTime}, ${checkOutTime}, ${workHours}, ${status}, 'Office')
      `;
    } else {
      await db`
        UPDATE attendance
        SET status = ${status}, check_in = ${checkInTime}, check_out = ${checkOutTime}, work_hours = ${workHours}
        WHERE id = ${recordId}
      `;
    }

    revalidatePath("/dashboard/attendance");
    revalidatePath("/my-profile/attendance");
    return { success: true };
  } catch (error) {
    console.error("[ATTENDANCE_OVERRIDE_ERROR]", error);
    return { success: false, error: "Failed to update attendance record." };
  }
}

export async function createShiftRule(formData: FormData) {
  try {
    const session = await auth();
    // SECURITY CHECK: Strictly block managers from creating global company rules
    if (session?.user?.role !== "admin") {
      return {
        success: false,
        error: "Only Admins can create global shift rules.",
      };
    }

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
    const employeeId = formData.get("employeeId") as string;
    const shiftRuleId = formData.get("shiftRuleId") as string;

    if (!employeeId || !shiftRuleId)
      return { success: false, error: "Employee and Shift Rule are required." };

    // SECURITY CHECK
    const isAuthorized = await authorizeManagerAction(employeeId);
    if (!isAuthorized)
      return {
        success: false,
        error: "Unauthorized to assign shifts to this employee.",
      };

    const shiftData =
      await db`SELECT shift_name, start_time, end_time FROM shift_rules WHERE id = ${shiftRuleId}`;
    if (!shiftData.length)
      return { success: false, error: "Shift rule not found." };

    // STRICT TYPING: Pull from the un-typed Row array and explicitly cast as strings
    const shiftName = shiftData[0].shift_name as string;
    const startTime = shiftData[0].start_time as string;
    const endTime = shiftData[0].end_time as string;

    await db`
      UPDATE users 
      SET shift_type = ${shiftName}, shift_start = ${startTime}, shift_end = ${endTime}
      WHERE id = ${employeeId}
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("[ASSIGN_SHIFT_ERROR]", error);
    return { success: false, error: "Failed to assign shift to employee." };
  }
}
