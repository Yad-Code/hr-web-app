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

    await db`
      UPDATE daily_attendance
      SET 
        status = ${status},
        check_in_time = ${checkInTime || null},
        check_out_time = ${checkOutTime || null},
        updated_at = NOW()
      WHERE id = ${recordId}
    `;

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("[ATTENDANCE_OVERRIDE_ERROR]", error);
    return { success: false, error: "Failed to update attendance record." };
  }
}
