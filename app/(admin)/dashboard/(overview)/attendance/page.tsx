import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import {
  AttendanceKpiData,
  DailyAttendanceRow,
  LeaveRequestRow,
  ShiftRule,
} from "./types";
import { AttendanceKpiCards } from "./_components/attendance-kpi-cards";
import { DailyAttendanceTable } from "./_components/daily-attendance-table";
import { LeaveRequestsList } from "./_components/leave-requests-list";
import { AttendanceHeaderActions } from "./_components/attendance-header-actions";
import { ShiftRulesCard } from "./_components/shift-rules-card";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

interface AttendanceDbRow {
  id: string | null;
  user_id: string;
  employee_name: string;
  department: string;
  image_url: string | null;
  shift_type: string; // <-- Added to combine queries
  status: "Present" | "Late" | "Absent" | "On Leave" | "Off Day" | null;
  check_in: string | null;
  check_out: string | null;
  work_hours: string | null;
  job_title: string | null;
  working_days: number[];
  created_at: string | Date | null;
}

interface LeaveRequestDbRow {
  id: string;
  employee_name: string;
  image_url: string | null;
  type: string;
  leave_category: string | null;
  start_date: string;
  end_date: string;
  total_days: number;
  hours: number;
  status: string;
  job_title: string | null;
  created_at: string | Date;
}

interface ShiftRuleDbRow {
  id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
}

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const todayString = new Date().toISOString().split("T")[0];

  const targetDate = resolvedParams.date || todayString;
 
  const attendanceRows = (await db`
    SELECT 
      a.id,
      u.id AS user_id,
      u.name AS employee_name,
      u.department,
      u.image_url,
      u.working_days, 
      u.shift_type,
      a.status,
      a.check_in,
      a.check_out,
      a.work_hours
    FROM users u
    LEFT JOIN attendance a ON u.id = a.user_id AND a.date = ${targetDate}
    WHERE u.role = 'employee'
    ORDER BY u.name ASC
  `) as unknown as AttendanceDbRow[];
 
  const totalEmployees = attendanceRows.length;  

  const employeeList = attendanceRows.map((row) => ({
    id: row.user_id,
    name: row.employee_name,
    department: row.department || "Unassigned",
    shift_type: row.shift_type || "Standard",
  })); 

  const [year, month, day] = targetDate.split("-").map(Number);
  const targetDayOfWeek = new Date(year, month - 1, day).getDay();

  const dailyLogs: DailyAttendanceRow[] = attendanceRows.map((row) => {
    let currentStatus = row.status;

    if (!currentStatus) {
      currentStatus = row.working_days.includes(targetDayOfWeek)
        ? "Absent"
        : "Off Day";
    }

    return {
      id: row.id || `pending-${row.user_id}`,
      employeeName: row.employee_name,
      department: row.department || "Unassigned",
      imageUrl: row.image_url,
      status: currentStatus as DailyAttendanceRow["status"],
      checkInTime: row.check_in || null,
      checkOutTime: row.check_out || null,
      workHours: row.work_hours || null,
    };
  });

  const presentToday = dailyLogs.filter((l) => l.status === "Present").length;
  const lateToday = dailyLogs.filter((l) => l.status === "Late").length;
  const absentToday = dailyLogs.filter((l) => l.status === "Absent").length;
  const onLeaveToday = dailyLogs.filter((l) => l.status === "On Leave").length;

  const kpis: AttendanceKpiData = {
    totalEmployees,
    presentToday,
    lateToday,
    absentToday,
    onLeaveToday,
  };

  const requestRows = (await db`
    SELECT 
      r.id,
      u.name AS employee_name,
      u.image_url,
      u.job_title,       
      r.created_at,      
      r.type, 
      r.leave_category,       
      r.start_date,
      r.end_date,
      r.total_days,     
      r.hours,
      r.status
    FROM leave_requests r
    JOIN users u ON r.user_id = u.id
  `) as unknown as LeaveRequestDbRow[];

  const leaveRequests: LeaveRequestRow[] = requestRows.map((row) => {
    let formattedType = row.type;
    if (row.type === "timeoff") formattedType = "Hourly Time-Off";
    else if (row.type === "dayoff")
      formattedType = row.leave_category
        ? `${row.leave_category} Leave`
        : "Day Off";
    else if (row.type === "wfh") formattedType = "Work From Home";
    else if (row.type === "exchange") formattedType = "Shift Exchange";

    return {
      id: row.id,
      employeeName: row.employee_name,
      imageUrl: row.image_url,
      leaveType: formattedType,
      startDate: row.start_date,
      endDate: row.end_date,
      days: row.total_days,
      hours: row.hours,
      jobTitle: row.job_title,
      createdAt: row.created_at,
      status: (row.status.charAt(0).toUpperCase() + row.status.slice(1)) as
        | "Pending"
        | "Approved"
        | "Rejected",
    };
  }) as unknown as LeaveRequestRow[];

  const shiftRows = (await db`
    SELECT id, shift_name, start_time, end_time, grace_period_minutes
    FROM shift_rules
    ORDER BY created_at ASC
  `) as unknown as ShiftRuleDbRow[];

  const shifts: ShiftRule[] = shiftRows.map((row) => ({
    id: row.id,
    shiftName: row.shift_name,
    startTime: row.start_time,
    endTime: row.end_time,
    gracePeriodMinutes: row.grace_period_minutes,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Time & Attendance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Enterprise workforce availability, shift policies, and time
            tracking.
          </p>
        </div>

        <AttendanceHeaderActions
          logs={dailyLogs}
          targetDate={targetDate}
          employees={employeeList}
          shifts={shifts}
        />
      </div>

      <AttendanceKpiCards stats={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 h-full">
          <DailyAttendanceTable logs={dailyLogs} />
        </div>

        <div className="space-y-8">
          <LeaveRequestsList requests={leaveRequests} />
          <ShiftRulesCard shifts={shifts} />
        </div>
      </div>
    </div>
  );
}
