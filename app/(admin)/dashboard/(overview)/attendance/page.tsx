// @/app/(admin)/dashboard/(overview)/attendance/page.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";
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

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) return null; // 👈 Ensure ID exists

  const isAdmin = session.user.isAdmin as boolean;
  const canApproveLeaves = session.user.canApproveLeaves as boolean;

  // 👇 FIX 1: Grab the Manager's UUID instead of their name
  const managerId = session.user.id;

  const resolvedParams = await searchParams;
  const todayString = new Date().toISOString().split("T")[0];
  const targetDate = resolvedParams.date || todayString;

  const [
    kpiStatsResult,
    rawLogsResult,
    requestRowsResult,
    shiftRowsResult,
    employeesResult,
  ] = await Promise.all([
    db`
      SELECT 
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_today,
        COUNT(CASE WHEN a.status = 'Late' THEN 1 END) as late_today,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_today,
        (
          SELECT COUNT(*) FROM leave_requests lr 
          JOIN users u ON lr.user_id = u.id
          WHERE lr.status = 'Approved' 
            AND ${targetDate}::date BETWEEN lr.start_date AND lr.end_date
            -- 👇 FIX 2: Filter by u.manager_id
            AND (${isAdmin}::boolean OR u.manager_id = ${managerId})
        ) as on_leave_today,
        (
          SELECT COUNT(*) FROM users 
          WHERE status = 'Active' AND role = 'employee'
            -- 👇 FIX 3: Filter by manager_id
            AND (${isAdmin}::boolean OR manager_id = ${managerId})
        ) as total_employees
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.date = ${targetDate}::date
        -- 👇 FIX 4: Filter by u.manager_id
        AND (${isAdmin}::boolean OR u.manager_id = ${managerId})
    `,
    db`
      SELECT 
        a.id, 
        u.name as employee_name, 
        u.department, 
        u.image_url, 
        a.status, 
        a.check_in, 
        a.check_out, 
        a.work_hours
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.date = ${targetDate}::date
        -- 👇 FIX 5: Filter by u.manager_id
        AND (${isAdmin}::boolean OR u.manager_id = ${managerId})
      ORDER BY a.created_at DESC
    `,

    db`
      SELECT 
        r.id, u.name AS employee_name, u.image_url, u.job_title,       
        r.created_at, r.type, r.leave_category, r.start_date, r.end_date,
        r.total_days, r.hours, r.status, r.reason,
        h.name AS helper_name
      FROM leave_requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users h ON r.helper_id = h.id
      -- 👇 FIX 6: Filter by u.manager_id
      WHERE (${isAdmin}::boolean OR u.manager_id = ${managerId})
      ORDER BY r.created_at DESC
    `,

    db`
      SELECT id, shift_name, start_time, end_time, grace_period_minutes
      FROM shift_rules
      ORDER BY created_at ASC
    `,

    db`
      SELECT id, name, department, shift_type 
      FROM users 
      WHERE status = 'Active' AND role = 'employee'
        -- 👇 FIX 7: Filter by manager_id
        AND (${isAdmin}::boolean OR manager_id = ${managerId})
    `,
  ]);

  const kpis: AttendanceKpiData = {
    presentToday: Number(kpiStatsResult[0]?.present_today || 0),
    lateToday: Number(kpiStatsResult[0]?.late_today || 0),
    absentToday: Number(kpiStatsResult[0]?.absent_today || 0),
    onLeaveToday: Number(kpiStatsResult[0]?.on_leave_today || 0),
    totalEmployees: Number(kpiStatsResult[0]?.total_employees || 0),
  };

  const dailyLogs: DailyAttendanceRow[] = rawLogsResult.map((row) => ({
    id: row.id as string,
    employeeName: row.employee_name as string,
    department: (row.department as string) || "Unassigned",
    imageUrl: row.image_url as string | null,
    status: row.status as DailyAttendanceRow["status"],
    checkInTime: row.check_in as string | null,
    checkOutTime: row.check_out as string | null,
    workHours: row.work_hours as string | null,
  }));

  const leaveRequests: LeaveRequestRow[] = requestRowsResult.map((row) => {
    let formattedType = row.type as string;
    if (formattedType === "timeoff") formattedType = "Hourly Time-Off";
    else if (formattedType === "dayoff")
      formattedType = row.leave_category
        ? `${row.leave_category} Leave`
        : "Day Off";
    else if (formattedType === "wfh") formattedType = "Work From Home";
    else if (formattedType === "exchange") formattedType = "Shift Exchange";

    return {
      id: row.id as string,
      employeeName: row.employee_name as string,
      imageUrl: row.image_url as string | null,
      leaveType: formattedType,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      days: Number(row.total_days),
      hours: Number(row.hours),
      jobTitle: row.job_title as string | null,
      createdAt: row.created_at as Date,
      reason: row.reason as string,
      helperName: row.helper_name as string | null,
      status: ((row.status as string).charAt(0).toUpperCase() +
        (row.status as string).slice(1)) as "Pending" | "Approved" | "Rejected",
    };
  });

  const shifts: ShiftRule[] = shiftRowsResult.map((row) => ({
    id: row.id as string,
    shiftName: row.shift_name as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    gracePeriodMinutes: Number(row.grace_period_minutes),
  }));

  const employeesList = employeesResult.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    department: (row.department as string) || "Unassigned",
    shift_type: (row.shift_type as string) || "Standard",
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {isAdmin ? "Time & Attendance" : "Team Attendance"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {isAdmin
              ? "Enterprise workforce availability, shift policies, and time tracking."
              : "Team availability, shift policies, and time tracking for your direct reports."}
          </p>
        </div>

        <AttendanceHeaderActions
          logs={dailyLogs}
          targetDate={targetDate}
          employees={employeesList}
          shifts={shifts}
        />
      </div>

      <AttendanceKpiCards stats={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 h-full">
          <DailyAttendanceTable logs={dailyLogs} />
        </div>

        <div className="space-y-8">
          <LeaveRequestsList
            requests={leaveRequests}
            currentUser={{ isAdmin, canApproveLeaves }}
          />
          <ShiftRulesCard shifts={shifts} />
        </div>
      </div>
    </div>
  );
}
