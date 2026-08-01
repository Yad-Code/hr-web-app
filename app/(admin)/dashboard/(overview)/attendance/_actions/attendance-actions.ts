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
