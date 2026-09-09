// lib/data/attendance.ts
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export interface AttendanceData {
  today: {
    checkIn: string | null;
    checkOut: string | null;
    status: "Checked In" | "Checked Out" | "Not Checked In" | "On Leave";
    shiftStart: string;
    shiftEnd: string;
    workLocation: "Office" | "WFH" | "Remote";
  };
  summary: {
    attendanceRate: number;
    daysPresent: number;
    lateArrivals: number;
    totalHoursLogged: number;
  };
  leaveBalance: {
    annualRemaining: number;
    annualTotal: number;
    sickRemaining: number;
    sickTotal: number;
    monthlyTotalHours: number;
    monthlyRemainingHours: number;
  };
  currentMonth: string;
  currentYear: number;
  calendarDays: Array<{
    date: string;
    status: "present" | "absent" | "late" | "leave" | "weekend" | "upcoming";
    checkIn?: string;
  }>;
  workingDays: number[];
  overrides: Array<{ date: string; isWorking: boolean }>;

  attendanceLog: Array<{
    id: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workHours: string;
    status: string;
    location: string;
  }>;
}

interface GeneratedLeaveLog {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  status: string;
  location: string;
}

export async function getAttendanceData(
  userId?: string,
  targetMonth?: string,
): Promise<AttendanceData> {
  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const currentYearNum = now.getFullYear();
  const targetDate = targetMonth ? new Date(`${targetMonth}-01T12:00:00`) : now;
  const targetY = targetDate.getFullYear();
  const targetM = targetDate.getMonth();

  try {
    if (!userId)
      return getFallbackAttendanceData(currentMonthName, currentYearNum);

    const localY = now.getFullYear();
    const localM = String(now.getMonth() + 1).padStart(2, "0");
    const localD = String(now.getDate()).padStart(2, "0");
    const todayStr = `${localY}-${localM}-${localD}`;

    const todayLogs =
      await sql`SELECT check_in, check_out, status, work_location FROM attendance WHERE user_id = ${userId} AND date = ${todayStr} LIMIT 1`;
    const monthlyLogs =
      await sql`SELECT id, date, check_in, check_out, work_hours, status, work_location FROM attendance WHERE user_id = ${userId} ORDER BY date DESC`;
    const balanceLogs =
      await sql`SELECT annual_total, annual_remaining, sick_total, sick_remaining, monthly_total_hours, monthly_remaining_hours FROM leave_balances WHERE user_id = ${userId} LIMIT 1`;
    const profile =
      await sql`SELECT working_days FROM users WHERE id = ${userId} LIMIT 1`;
    const overridesLog =
      await sql`SELECT target_date, is_working FROM schedule_overrides WHERE user_id = ${userId}`;
    const approvedLeavesLog =
      await sql`SELECT id, start_date, end_date FROM leave_requests WHERE user_id = ${userId} AND type = 'dayoff' AND status = 'Approved'`;

    const workingDays = profile[0]?.working_days || [1, 2, 3, 4, 5];
    const todayRecord = todayLogs[0];
    const balanceRecord = balanceLogs[0];

    const isCurrentMonth =
      targetY === now.getFullYear() && targetM === now.getMonth();
    const limitDate = isCurrentMonth
      ? now.getDate()
      : new Date(targetY, targetM + 1, 0).getDate();

    let expectedWorkingDays = 0;
    let scheduledDaysPresent = 0; 
    let totalDaysPresent = 0;  
    let lateArrivals = 0;
    let totalMinutes = 0;

    // Calculate matching schedule vs actual attendance for the rate
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

    // 2. Safely calculate total hours and overall days present for the month
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
      overrides: overridesLog.map((o) => {
        const oDate = new Date(o.target_date);
        return {
          date: oDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          isWorking: o.is_working,
        };
      }),
      attendanceLog: [
        ...monthlyLogs.map((log) => {
          const lDate = new Date(log.date);
          return {
            id: log.id,
            date: lDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            checkIn: log.check_in || "--:--",
            checkOut: log.check_out || "--:--",
            workHours: log.work_hours || "0h 0m",
            status: log.status || "Present",
            location: log.work_location || "Office",
          };
        }),
        ...generatedLeaveLogs,
      ],
    };
  } catch (error) {
    console.error("Failed to fetch attendance data:", error);
    return getFallbackAttendanceData(currentMonthName, currentYearNum);
  }
}

function getFallbackAttendanceData(
  month: string,
  year: number,
): AttendanceData {
  return {
    today: {
      checkIn: "08:55 AM",
      checkOut: null,
      status: "Checked In",
      shiftStart: "09:00 AM",
      shiftEnd: "05:00 PM",
      workLocation: "Office",
    },
    summary: {
      attendanceRate: 98,
      daysPresent: 21,
      lateArrivals: 1,
      totalHoursLogged: 160,
    },
    leaveBalance: {
      annualRemaining: 14,
      annualTotal: 20,
      sickRemaining: 6,
      sickTotal: 10,
      monthlyTotalHours: 16,
      monthlyRemainingHours: 14,
    },
    currentMonth: month,
    currentYear: year,
    calendarDays: [],
    // ADDED: Fallback values for the new scheduling system
    workingDays: [1, 2, 3, 4, 5], // Default Monday to Friday
    overrides: [], // No shift swaps in the fallback data
    attendanceLog: [
      {
        id: "1",
        date: "Jul 20, 2026",
        checkIn: "08:55 AM",
        checkOut: "05:02 PM",
        workHours: "8h 07m",
        status: "Present",
        location: "Office",
      },
      {
        id: "2",
        date: "Jul 19, 2026",
        checkIn: "09:12 AM",
        checkOut: "05:15 PM",
        workHours: "8h 03m",
        status: "Late",
        location: "Office",
      },
    ],
  };
}
