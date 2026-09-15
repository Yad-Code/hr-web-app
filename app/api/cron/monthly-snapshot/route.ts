// @/app/api/cron/monthly-snapshot/route.ts

import { NextResponse } from "next/server";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export async function GET(request: Request) {
  // 1. Security Check (Vercel Cron Authentication)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try { 
    const now = new Date();
    const targetY = now.getFullYear();
    const targetM = now.getMonth(); 
    const dbMonthDate = `${targetY}-${String(targetM + 1).padStart(2, "0")}-01`;
    const daysInMonth = new Date(targetY, targetM + 1, 0).getDate();
 
    const employees =
      await db`SELECT id, working_days FROM users WHERE status = 'Active'`;

    let processedCount = 0;
 
    for (const emp of employees) { 
      const monthlyLogs = await db`
        SELECT date, status FROM attendance 
        WHERE user_id = ${emp.id} 
        AND EXTRACT(MONTH FROM date) = ${targetM + 1} 
        AND EXTRACT(YEAR FROM date) = ${targetY}
      `;

      const overridesLog = await db`
        SELECT target_date, is_working FROM schedule_overrides 
        WHERE user_id = ${emp.id} 
        AND EXTRACT(MONTH FROM target_date) = ${targetM + 1}
      `;

      const approvedLeaves = await db`
        SELECT start_date, end_date FROM leave_requests 
        WHERE user_id = ${emp.id} AND type = 'dayoff' AND status = 'Approved'
      `;

      let expectedWorkingDays = 0;
      let scheduledDaysPresent = 0;
 
      for (let i = 1; i <= daysInMonth; i++) {
        const dObj = new Date(targetY, targetM, i);
        let isWorkingDay = emp.working_days?.includes(dObj.getDay()) ?? false;

        const override = overridesLog.find(
          (o) => new Date(o.target_date).getDate() === i,
        );
        if (override) isWorkingDay = override.is_working;

        const isOnLeave = approvedLeaves.some((leave) => {
          const s = new Date(leave.start_date);
          const e = new Date(leave.end_date);
          s.setHours(0, 0, 0, 0);
          e.setHours(0, 0, 0, 0);
          return dObj >= s && dObj <= e;
        });

        if (isWorkingDay && !isOnLeave) {
          expectedWorkingDays++;
          const logForDay = monthlyLogs.find(
            (l) => new Date(l.date).getDate() === i,
          );
          if (
            logForDay &&
            ["present", "late"].includes(logForDay.status?.toLowerCase())
          ) {
            scheduledDaysPresent++;
          }
        }
      }
 
      const attendanceRate =
        expectedWorkingDays > 0
          ? Math.round((scheduledDaysPresent / expectedWorkingDays) * 100)
          : 100;
 
      await db`
        INSERT INTO performance_history (user_id, month, attendance)
        VALUES (${emp.id}, ${dbMonthDate}, ${attendanceRate})
        ON CONFLICT (user_id, month) 
        DO UPDATE SET attendance = ${attendanceRate}
      `;

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated end-of-month snapshots for ${processedCount} employees.`,
      month: dbMonthDate,
    });
  } catch (error) {
    console.error("[MONTHLY_SNAPSHOT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate snapshot" },
      { status: 500 },
    );
  }
}
