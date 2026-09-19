// @/app/lib/employeeDashboard/employee/actions.ts
"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  getFormattedTime,
  calculateWorkHours,
} from "@/app/lib/employeeDashboard/employee/data";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { AppCatchError } from "@/app/lib/employee/definitions";

function getLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function toggleCheckInStatus(
  location: "Office" | "Remote" = "Office",
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    const userQuery =
      await db`SELECT u.id, u.working_days, u.shift_start, r.grace_period_minutes FROM users u LEFT JOIN shift_rules r ON u.shift_type = r.shift_name WHERE u.id = ${userId}::uuid`;

    if (!userQuery.length) return { success: false, error: "User not found." };

    const user = userQuery[0];
    const workingDays = user.working_days || [1, 2, 3, 4, 5];

    const todayStr = getLocalDateString();
    const timeString12hr = getFormattedTime();
    const now = new Date();

    const [y, m, d] = todayStr.split("-");
    const dayOfWeek = new Date(Number(y), Number(m) - 1, Number(d)).getDay();
    let isWorkingDay = workingDays.includes(dayOfWeek);

    const overrideQuery =
      await db`SELECT is_working FROM schedule_overrides WHERE user_id = ${userId}::uuid AND target_date = ${todayStr}`;
    if (overrideQuery.length > 0) isWorkingDay = overrideQuery[0].is_working;

    const existingLog =
      await db`SELECT id, check_in, check_out FROM attendance WHERE user_id = ${userId}::uuid AND date = ${todayStr} LIMIT 1`;

    if (!isWorkingDay && (!existingLog || existingLog.length === 0)) {
      return {
        success: false,
        error: "You are not scheduled to work today. Enjoy your day off!",
      };
    }

    if (existingLog && existingLog.length > 0) {
      const log = existingLog[0];
      if (log.check_out)
        return { success: false, error: "Shift already completed for today." };

      const checkInTime = log.check_in || timeString12hr;
      const workHoursStr = calculateWorkHours(checkInTime, timeString12hr);

      await db`UPDATE attendance SET check_out = ${timeString12hr}, work_hours = ${workHoursStr} WHERE id = ${log.id}::uuid`;
    } else {
      const shiftStart = user.shift_start || "09:00:00";
      const gracePeriod = user.grace_period_minutes || 15;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = shiftStart.split(":").map(Number);
      const shiftStartMinutes = startHour * 60 + startMin;

      const isLate = currentMinutes > shiftStartMinutes + gracePeriod;
      const status = isLate ? "Late" : "Present";

      await db`INSERT INTO attendance (user_id, date, check_in, status, work_location) VALUES (${userId}::uuid, ${todayStr}, ${timeString12hr}, ${status}, ${location})`;
    }

    revalidatePath("/my-profile/attendance");
    return { success: true };
  } catch (error: unknown) {
    const e = (
      error instanceof Error ? error : new Error(String(error))
    ) as AppCatchError;
    console.error("Check-In Error:", e);
    return { success: false, error: `Server error: ${e.message}` };
  }
}

export async function submitWFHRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const helperId = formData.get("helperId") as string | null;
  const type = (formData.get("type") as string) || "wfh";
  const reason = formData.get("reason") as string;

  if (!reason) return { success: false, error: "Reason is required." };

  try {
    const userQuery =
      await db`SELECT id, manager_id FROM users WHERE id = ${session.user.id}::uuid`;
    if (!userQuery.length) return { success: false, error: "User not found." };

    const userId = userQuery[0].id;
    const managerId = userQuery[0].manager_id;
    const [balance] =
      await db`SELECT annual_remaining, sick_remaining, monthly_remaining_hours FROM leave_balances WHERE user_id = ${userId}::uuid`;

    let startDate: string | null = null,
      endDate: string | null = null,
      leaveCategory: string | null = null;
    let totalDays = 0,
      hours = 0;
    let originalDate: string | null = null,
      exchangeDate: string | null = null;

    if (type === "wfh") {
      startDate = formData.get("date") as string;
      endDate = startDate;
      totalDays = 1;
      if (!startDate)
        return { success: false, error: "Date is required for WFH." };
    } else if (type === "dayoff") {
      startDate = formData.get("startDate") as string;
      endDate = formData.get("endDate") as string;
      leaveCategory = (formData.get("leaveCategory") as string) || "annual";
      totalDays = Number(formData.get("totalDays")) || 1;

      if (!startDate || !endDate)
        return { success: false, error: "Start and end dates required." };

      if (balance) {
        if (leaveCategory === "annual" && totalDays > balance.annual_remaining)
          return { success: false, error: "Insufficient Annual Leave." };
        if (leaveCategory === "sick" && totalDays > balance.sick_remaining)
          return { success: false, error: "Insufficient Sick Leave." };
      }
    } else if (type === "timeoff") {
      startDate = formData.get("date") as string;
      endDate = startDate;
      hours = Number(formData.get("hours")) || 0;

      if (!startDate || hours <= 0)
        return { success: false, error: "Valid date and hours required." };
      if (balance && hours > balance.monthly_remaining_hours)
        return { success: false, error: "Insufficient monthly hours." };
    } else if (type === "exchange") {
      originalDate = formData.get("originalDate") as string;
      exchangeDate = formData.get("exchangeDate") as string;
      if (!originalDate || !exchangeDate)
        return {
          success: false,
          error: "Original and exchange dates required.",
        };
    }

    const helperStatus = type === "exchange" ? "Pending" : "N/A";

    await db`
      INSERT INTO leave_requests (user_id, type, leave_category, start_date, end_date, total_days, hours, original_date, exchange_date, helper_id, helper_status, reason, status)
      VALUES (${userId}::uuid, ${type}, ${leaveCategory || null}, ${startDate || null}, ${endDate || null}, ${totalDays}, ${hours}, ${originalDate || null}, ${exchangeDate || null}, ${helperId ? `${helperId}::uuid` : null}, ${helperStatus}, ${reason}, 'Pending')
    `;

    if (type === "exchange" && helperId) {
      await db`INSERT INTO performance_notifications (user_id, requester_id, title, description, type) VALUES (${helperId}::uuid, ${userId}::uuid, 'Shift Exchange Request', 'Someone wants to trade shifts with you.', 'Exchange')`;
    } else if (managerId) {
      await db`INSERT INTO performance_notifications (user_id, requester_id, title, description, type) VALUES (${managerId}::uuid, ${userId}::uuid, 'New Leave Request', 'An employee has requested time off pending your approval.', 'Leave')`;
    }

    revalidatePath("/my-profile/attendance");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const e = (
      error instanceof Error ? error : new Error(String(error))
    ) as AppCatchError;
    console.error("Leave request error:", e);
    return { success: false, error: "Could not submit leave request." };
  }
}

export async function respondToExchangeRequest(
  requestId: string,
  status: "Accepted" | "Rejected",
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // 👇 SECURITY FIX: Ensure the logged-in user is actually the assigned helper!
    const reqCheck =
      await db`SELECT helper_id FROM leave_requests WHERE id = ${requestId}::uuid LIMIT 1`;

    if (reqCheck.length === 0 || reqCheck[0].helper_id !== session.user.id) {
      return {
        success: false,
        error: "Forbidden: You are not authorized to respond to this request.",
      };
    }

    if (status === "Rejected") {
      await db`UPDATE leave_requests SET helper_status = 'Rejected', status = 'Rejected' WHERE id = ${requestId}::uuid`;
    } else {
      await db`UPDATE leave_requests SET helper_status = 'Accepted' WHERE id = ${requestId}::uuid`;

      const reqQuery =
        await db`SELECT r.user_id, u.manager_id FROM leave_requests r JOIN users u ON r.user_id = u.id WHERE r.id = ${requestId}::uuid`;
      if (reqQuery.length > 0 && reqQuery[0].manager_id) {
        await db`INSERT INTO performance_notifications (user_id, requester_id, title, description, type) VALUES (${reqQuery[0].manager_id}::uuid, ${reqQuery[0].user_id}::uuid, 'Shift Swap Ready', 'A shift swap was accepted and requires final approval.', 'Exchange')`;
      }
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    const e = (
      error instanceof Error ? error : new Error(String(error))
    ) as AppCatchError;
    console.error("Failed to respond to exchange:", e);
    return { success: false, error: "Failed to update request." };
  }
}

export async function exportAttendanceCSV(monthStr?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    const userQuery =
      await db`SELECT id, name, working_days FROM users WHERE id = ${userId}::uuid`;
    if (!userQuery.length) return { success: false, error: "User not found." };

    const user = userQuery[0];
    const workingDays = user.working_days || [1, 2, 3, 4, 5];

    let yearNum: number, monthNum: number;
    if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
      const [y, m] = monthStr.split("-");
      yearNum = parseInt(y, 10);
      monthNum = parseInt(m, 10) - 1;
    } else {
      const now = new Date();
      yearNum = now.getFullYear();
      monthNum = now.getMonth();
    }

    const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs =
      await db`SELECT date, check_in, check_out, work_hours, status, work_location FROM attendance WHERE user_id = ${userId}::uuid`;
    const overrides =
      await db`SELECT target_date, is_working FROM schedule_overrides WHERE user_id = ${userId}::uuid`;

    const headers = [
      "Date",
      "Check In",
      "Check Out",
      "Work Hours",
      "Location",
      "Status",
    ];
    const csvRows = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(yearNum, monthNum, i);
      const dbDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      const displayDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const log = logs.find((l) =>
        (typeof l.date === "string" ? l.date : l.date.toISOString()).startsWith(
          dbDateStr,
        ),
      );
      const override = overrides.find((o) =>
        (typeof o.target_date === "string"
          ? o.target_date
          : o.target_date.toISOString()
        ).startsWith(dbDateStr),
      );

      let isWorkingDay = workingDays.includes(dateObj.getDay());
      let overrideBadge = null;

      if (override) {
        isWorkingDay = override.is_working;
        overrideBadge = override.is_working ? "Swapped In" : "Swapped Out";
      }

      let status = "";
      const checkIn = log?.check_in || "--:--";
      const checkOut = log?.check_out || "--:--";
      const workHours = log?.work_hours || "--";
      let location = log?.work_location || "--";

      if (!isWorkingDay) {
        status = overrideBadge || "Off Day";
        location = "--";
      } else if (log) {
        status = overrideBadge
          ? `${log.status} (${overrideBadge})`
          : log.status;
      } else {
        if (dateObj < today) {
          status = "Absent";
        } else {
          status = overrideBadge ? `Scheduled (${overrideBadge})` : "Scheduled";
          location = dateObj.getTime() === today.getTime() ? "Pending" : "--";
        }
      }
      csvRows.push(
        `"${displayDate}","${checkIn}","${checkOut}","${workHours}","${location}","${status}"`,
      );
    }

    csvRows.reverse();
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    return {
      success: true,
      csv: csvContent,
      filename: `${user.name.replace(/\s+/g, "_")}_Timesheet_${yearNum}_${String(monthNum + 1).padStart(2, "0")}.csv`,
    };
  } catch (error: unknown) {
    const e = (
      error instanceof Error ? error : new Error(String(error))
    ) as AppCatchError;
    console.error("Export Error:", e);
    return { success: false, error: "Failed to generate export file." };
  }
}
