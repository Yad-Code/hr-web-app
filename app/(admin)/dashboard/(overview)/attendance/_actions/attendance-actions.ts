// @/app/(admin)/dashboard/(overview)/attendance/_actions/attendance-actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

export async function overrideAttendanceRecord(formData: FormData) {
  try {
    const recordId = formData.get("recordId") as string;
    const targetDate = formData.get("targetDate") as string;
    const status = formData.get("status") as string;
    const rawCheckIn = formData.get("checkInTime") as string;
    const rawCheckOut = formData.get("checkOutTime") as string;

    if (!recordId) return { success: false, error: "Record ID is missing." };

    // Format 24hr HTML time to 12hr AM/PM for the database
    const formatTo12Hr = (time24: string) => {
      if (!time24) return null;
      const [h, m] = time24.split(":");
      const hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
    };

    const checkInTime = formatTo12Hr(rawCheckIn);
    const checkOutTime = formatTo12Hr(rawCheckOut);

    // Automatically calculate work hours
    let workHours: string | null = null;
    if (rawCheckIn && rawCheckOut) {
      const [inHours, inMinutes] = rawCheckIn.split(":").map(Number);
      const [outHours, outMinutes] = rawCheckOut.split(":").map(Number);

      const totalInMinutes = inHours * 60 + inMinutes;
      const totalOutMinutes = outHours * 60 + outMinutes;

      let diffMinutes = totalOutMinutes - totalInMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      workHours = `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
    }

    // Upsert Logic: If it's a pending ID, insert a new row. Otherwise, update.
    if (recordId.startsWith("pending-")) {
      const userId = recordId.replace("pending-", "");
      await db`
        INSERT INTO attendance (user_id, date, check_in, check_out, work_hours, status, work_location)
        VALUES (${userId}, ${targetDate}, ${checkInTime}, ${checkOutTime}, ${workHours}, ${status}, 'Office')
      `;
    } else {
      await db`
        UPDATE attendance
        SET 
          status = ${status},
          check_in = ${checkInTime},
          check_out = ${checkOutTime},
          work_hours = ${workHours}
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
