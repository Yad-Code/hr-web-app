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

export async function getAttendanceData(
  userId?: string,
): Promise<AttendanceData> {
  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const currentYearNum = now.getFullYear();

  try {
    if (!userId) {
      return getFallbackAttendanceData(currentMonthName, currentYearNum);
    }

    const todayStr = now.toISOString().split("T")[0];
    const todayLogs = await sql`
      SELECT check_in, check_out, status, work_location
      FROM attendance
      WHERE user_id = ${userId} AND date = ${todayStr}
      LIMIT 1
    `;

    const monthlyLogs = await sql`
      SELECT id, date, check_in, check_out, work_hours, status, work_location
      FROM attendance
      WHERE user_id = ${userId}
      ORDER BY date DESC
    `;

    const balanceLogs = await sql`
      SELECT annual_total, annual_remaining, sick_total, sick_remaining, monthly_total_hours, monthly_remaining_hours
      FROM leave_balances
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const profile =
      await sql`SELECT working_days FROM users WHERE id = ${userId} LIMIT 1`;
    const overridesLog =
      await sql`SELECT target_date, is_working FROM schedule_overrides WHERE user_id = ${userId}`;

    const todayRecord = todayLogs[0];
    const balanceRecord = balanceLogs[0];

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
        attendanceRate: 96,
        daysPresent: monthlyLogs.length,
        lateArrivals: monthlyLogs.filter((l) => l.status === "Late").length,
        totalHoursLogged: 168,
      },
      leaveBalance: {
        annualRemaining: balanceRecord?.annual_remaining ?? 0,
        annualTotal: balanceRecord?.annual_total ?? 20,
        sickRemaining: balanceRecord?.sick_remaining ?? 0,
        sickTotal: balanceRecord?.sick_total ?? 10,
        monthlyTotalHours: balanceRecord?.monthly_total_hours ?? 16,
        monthlyRemainingHours: balanceRecord?.monthly_remaining_hours ?? 0,
      },
      currentMonth: currentMonthName,
      currentYear: currentYearNum,
      calendarDays: [],
      workingDays: profile[0]?.working_days || [1, 2, 3, 4, 5],
      overrides: overridesLog.map((o) => ({
        date: new Date(o.target_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isWorking: o.is_working,
      })),
      attendanceLog: monthlyLogs.map((log) => ({
        id: log.id,
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
