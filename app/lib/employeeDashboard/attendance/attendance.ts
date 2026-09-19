// @/app/lib/employeeDashboard/attendance/attendance.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { AttendanceData, PendingExchangeRequest } from "./definitions";

interface GeneratedLeaveLog {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  status: string;
  location: string;
}

export async function getColleaguesForLeave(userId: string) {
  try {
    const userProfile =
      await db`SELECT department FROM users WHERE id = ${userId}::uuid LIMIT 1`;
    const userDept = userProfile[0]?.department;

    if (!userDept) return [];

    const colleaguesQuery = await db`
      SELECT id, name, job_title, working_days 
      FROM users 
      WHERE role = 'employee' 
        AND id != ${userId}::uuid
        AND department = ${userDept}
      ORDER BY name ASC
    `;

    return colleaguesQuery.map((c) => ({
      id: c.id as string,
      name: c.name as string,
      job_title: c.job_title as string | null,
      working_days: (c.working_days as number[]) || [1, 2, 3, 4, 5],
    }));
  } catch (error) {
    console.error("Failed to fetch colleagues:", error);
    return [];
  }
}

export async function getPendingExchanges(
  userId: string,
): Promise<PendingExchangeRequest[]> {
  try {
    const pendingExchangesQuery = await db`
      SELECT r.id, r.original_date, r.exchange_date, r.reason, u.name as requester_name
      FROM leave_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.helper_id = ${userId}::uuid AND r.helper_status = 'Pending'
    `;

    return pendingExchangesQuery.map((r) => ({
      id: String(r.id),
      original_date: r.original_date as string | Date,
      exchange_date: r.exchange_date as string | Date,
      reason: String(r.reason),
      requester_name: String(r.requester_name),
    }));
  } catch (error) {
    console.error("Failed to fetch pending exchanges:", error);
    return [];
  }
}

export async function getAttendanceData(
  userId: string,
  targetMonth?: string,
): Promise<AttendanceData> {
  const now = new Date();
  const targetDate = targetMonth ? new Date(`${targetMonth}-01T12:00:00`) : now;
  const targetY = targetDate.getFullYear();
  const targetM = targetDate.getMonth();

  try {
    const localY = now.getFullYear();
    const localM = String(now.getMonth() + 1).padStart(2, "0");
    const localD = String(now.getDate()).padStart(2, "0");
    const todayStr = `${localY}-${localM}-${localD}`;

    const [
      todayLogs,
      monthlyLogs,
      balanceLogs,
      profile,
      overridesLog,
      approvedLeavesLog,
    ] = await Promise.all([
      db`SELECT check_in, check_out, status, work_location FROM attendance WHERE user_id = ${userId}::uuid AND date = ${todayStr} LIMIT 1`,
      db`SELECT id, date, check_in, check_out, work_hours, status, work_location FROM attendance WHERE user_id = ${userId}::uuid ORDER BY date DESC`,
      db`SELECT annual_total, annual_remaining, sick_total, sick_remaining, monthly_total_hours, monthly_remaining_hours FROM leave_balances WHERE user_id = ${userId}::uuid LIMIT 1`,
      db`SELECT working_days FROM users WHERE id = ${userId}::uuid LIMIT 1`,
      db`SELECT target_date, is_working FROM schedule_overrides WHERE user_id = ${userId}::uuid`,
      db`SELECT id, start_date, end_date FROM leave_requests WHERE user_id = ${userId}::uuid AND type = 'dayoff' AND status = 'Approved'`,
    ]);

    const workingDays = profile[0]?.working_days || [1, 2, 3, 4, 5];
    const todayRecord = todayLogs[0];
    const balanceRecord = balanceLogs[0];

    const isCurrentMonth =
      targetY === now.getFullYear() && targetM === now.getMonth();
    const limitDate = isCurrentMonth
      ? now.getDate()
      : new Date(targetY, targetM + 1, 0).getDate();

    let expectedWorkingDays = 0,
      scheduledDaysPresent = 0,
      totalDaysPresent = 0,
      lateArrivals = 0,
      totalMinutes = 0;

    for (let i = 1; i <= limitDate; i++) {
      const dObj = new Date(targetY, targetM, i);
      let isWorkingDay = workingDays.includes(dObj.getDay());

      const override = overridesLog.find((o) => {
        const oDate = new Date(o.target_date);
        return (
          oDate.getFullYear() === targetY &&
          oDate.getMonth() === targetM &&
          oDate.getDate() === i
        );
      });
      if (override) isWorkingDay = override.is_working;

      const isOnLeave = approvedLeavesLog.some((leave) => {
        const s = new Date(leave.start_date);
        const e = new Date(leave.end_date);
        s.setHours(0, 0, 0, 0);
        e.setHours(0, 0, 0, 0);
        return dObj >= s && dObj <= e;
      });

      const logForDay = monthlyLogs.find((l) => {
        const lDate = new Date(l.date);
        return (
          lDate.getFullYear() === targetY &&
          lDate.getMonth() === targetM &&
          lDate.getDate() === i
        );
      });

      if (isWorkingDay && !isOnLeave) {
        expectedWorkingDays++;
        if (
          logForDay &&
          ["present", "late"].includes(
            (logForDay.status || "").trim().toLowerCase(),
          )
        ) {
          scheduledDaysPresent++;
        }
      }
    }

    const allMonthLogs = monthlyLogs.filter((l) => {
      const lDate = new Date(l.date);
      return lDate.getFullYear() === targetY && lDate.getMonth() === targetM;
    });

    allMonthLogs.forEach((log) => {
      const status = (log.status || "").trim().toLowerCase();
      if (status === "present" || status === "late") totalDaysPresent++;
      if (status === "late") lateArrivals++;

      if (status === "present" || status === "late") {
        if (log.work_hours) {
          const match = log.work_hours.match(/(\d+)\s*h\s*(\d*)\s*m?/i);
          if (match)
            totalMinutes +=
              (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
        }
      }
    });

    const totalHoursLogged = Math.floor(totalMinutes / 60);
    const attendanceRate =
      expectedWorkingDays > 0
        ? Math.round((scheduledDaysPresent / expectedWorkingDays) * 100)
        : 100;

    const generatedLeaveLogs: GeneratedLeaveLog[] = [];
    approvedLeavesLog.forEach((leave) => {
      const s = new Date(leave.start_date);
      const e = new Date(leave.end_date);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === targetM && d.getFullYear() === targetY) {
          generatedLeaveLogs.push({
            id: `leave-${leave.id}-${d.getTime()}`,
            date: d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            checkIn: "--:--",
            checkOut: "--:--",
            workHours: "--",
            status: "On Leave",
            location: "Approved PTO",
          });
        }
      }
    });

    return {
      today: {
        checkIn: todayRecord?.check_in || null,
        checkOut: todayRecord?.check_out || null,
        status: todayRecord ? todayRecord.status : "Not Checked In",
        shiftStart: "09:00 AM",
        shiftEnd: "05:00 PM",
        workLocation: todayRecord?.work_location || "Office",
      },
      summary: {
        attendanceRate,
        daysPresent: totalDaysPresent,
        lateArrivals,
        totalHoursLogged,
      },
      leaveBalance: {
        annualRemaining: balanceRecord?.annual_remaining ?? 0,
        annualTotal: balanceRecord?.annual_total ?? 20,
        sickRemaining: balanceRecord?.sick_remaining ?? 0,
        sickTotal: balanceRecord?.sick_total ?? 10,
        monthlyTotalHours: balanceRecord?.monthly_total_hours ?? 16,
        monthlyRemainingHours: balanceRecord?.monthly_remaining_hours ?? 0,
      },
      calendarDays: [],
      workingDays,
      currentMonth: targetDate.toLocaleString("en-US", { month: "long" }),
      currentYear: targetY,
      overrides: overridesLog.map((o) => ({
        date: new Date(o.target_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isWorking: o.is_working,
      })),
      attendanceLog: [
        ...monthlyLogs.map((log) => ({
          id: String(log.id),
          date: new Date(log.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          checkIn: log.check_in || "--:--",
          checkOut: log.check_out || "--:--",
          workHours: log.work_hours || "0h 0m",
          status: log.status || "Present",
          location: log.work_location || "Office",
        })),
        ...generatedLeaveLogs,
      ],
    };
  } catch (error) {
    console.error("Failed to fetch attendance data:", error);
    throw new Error("Unable to connect to the attendance database.");
  }
}
