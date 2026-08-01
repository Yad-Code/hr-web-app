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

export default async function AdminAttendancePage() {
  // Target date aligned with seeded attendance records
  const targetDate = "2026-07-21";

  // 1. Fetch Total Employees Count
  const [totalResult] = await db`
    SELECT COUNT(*)::int as count FROM users WHERE role = 'employee'
  `;
  const totalEmployees = totalResult?.count || 0;

  // 2. Fetch Daily Attendance Logs for the target date
  const attendanceRows = await db`
    SELECT 
      a.id,
      u.name AS employee_name,
      u.department,
      u.image_url,
      a.status,
      a.check_in,
      a.check_out,
      a.work_hours
    FROM attendance a
    JOIN users u ON a.user_id = u.id
    WHERE a.date = ${targetDate}
  `;

  const dailyLogs: DailyAttendanceRow[] = attendanceRows.map((row: any) => ({
    id: row.id,
    employeeName: row.employee_name,
    department: row.department,
    imageUrl: row.image_url,
    status: row.status,
    checkInTime: row.check_in,
    checkOutTime: row.check_out,
    workHours: row.work_hours,
  }));

  // Calculate live KPIs from fetched records
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

  // 3. Fetch Time-Off/Leave Requests from the requests table
  const requestRows = await db`
    SELECT 
      r.id,
      u.name AS employee_name,
      u.image_url,
      r.type,
      r.description,
      r.status
    FROM requests r
    JOIN users u ON r.employee_id = u.id
  `;

  const leaveRequests: LeaveRequestRow[] = requestRows.map((row: any) => ({
    id: row.id,
    employeeName: row.employee_name,
    imageUrl: row.image_url,
    leaveType: row.type === "time-off" ? "Annual Vacation" : row.type,
    startDate: "Jul 28",
    endDate: "Jul 30",
    days: 2,
    status: (row.status.charAt(0).toUpperCase() + row.status.slice(1)) as
      | "Pending"
      | "Approved"
      | "Rejected",
  }));

  // 4. Fetch dynamic shift configurations from employee records
  const shiftRows = await db`
    SELECT DISTINCT shift_type, shift_start, shift_end 
    FROM users 
    WHERE role = 'employee'
  `;

  const shifts: ShiftRule[] = shiftRows.map((row: any, index: number) => ({
    id: `s_${index + 1}`,
    shiftName: row.shift_type,
    startTime: row.shift_start,
    endTime: row.shift_end,
    gracePeriodMinutes: 15,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
      {/* Header */}
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
        <AttendanceHeaderActions logs={dailyLogs} />
      </div>

      {/* KPI Overviews */}
      <AttendanceKpiCards stats={kpis} />

      {/* Main Layout Grid */}
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
