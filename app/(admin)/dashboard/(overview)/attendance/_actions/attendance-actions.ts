// @/app/(admin)/dashboard/(overview)/attendance/_actions/attendance-actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

export async function overrideAttendanceRecord(formData: FormData) {
  try {
    const recordId = formData.get("recordId") as string;
    const status = formData.get("status") as string;
    const checkInTime = formData.get("checkInTime") as string;
    const checkOutTime = formData.get("checkOutTime") as string;

    if (!recordId) {
      return { success: false, error: "Record ID is missing." };
    }

    // Automatically calculate work hours if both times are present
    let workHours: string | null = null;
    if (checkInTime && checkOutTime) {
      const [inHours, inMinutes] = checkInTime.split(":").map(Number);
      const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

      const totalInMinutes = inHours * 60 + inMinutes;
      const totalOutMinutes = outHours * 60 + outMinutes;

      let diffMinutes = totalOutMinutes - totalInMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight shifts if applicable

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      workHours = `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
    }

    // Update the attendance table with new status, times, and calculated hours
    await db`
      UPDATE attendance
      SET 
        status = ${status},
        check_in = ${checkInTime || null},
        check_out = ${checkOutTime || null},
        work_hours = ${workHours}
      WHERE id = ${recordId}
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("[ATTENDANCE_OVERRIDE_ERROR]", error);
    return { success: false, error: "Failed to update attendance record." };
  }
}

export async function createShiftRule(formData: FormData) {
  try {
    const shiftName = formData.get("shiftName") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const gracePeriod = Number(formData.get("gracePeriod")) || 15;

    if (!shiftName || !startTime || !endTime) {
      return { success: false, error: "All fields are required." };
    }

    await db`
      INSERT INTO shift_rules (shift_name, start_time, end_time, grace_period_minutes)
      VALUES (${shiftName}, ${startTime}, ${endTime}, ${gracePeriod})
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create shift rule:", error);
    return { success: false, error: "Failed to create shift rule." };
  }
}
 
export async function assignEmployeeShift(formData: FormData) {
  try {
    const employeeId = formData.get("employeeId") as string;
    const shiftRuleId = formData.get("shiftRuleId") as string;

    if (!employeeId || !shiftRuleId) {
      return { success: false, error: "Employee and Shift Rule are required." };
    }

    const shiftData = await db`
      SELECT shift_name, start_time, end_time FROM shift_rules WHERE id = ${shiftRuleId}
    `;

    if (!shiftData || shiftData.length === 0) {
      return { success: false, error: "Shift rule not found." };
    }

    const shift = shiftData[0];

    await db`
      UPDATE users 
      SET 
        shift_type = ${shift.shift_name},
        shift_start = ${shift.start_time},
        shift_end = ${shift.end_time}
      WHERE id = ${employeeId}
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign shift:", error);
    return { success: false, error: "Failed to assign shift to employee." };
  }
}