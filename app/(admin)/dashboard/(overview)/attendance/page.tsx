import {
  AttendanceKpiData,
  DailyAttendanceRow,
  LeaveRequestRow,
} from "./types";
import { AttendanceKpiCards } from "./_components/attendance-kpi-cards";
import { DailyAttendanceTable } from "./_components/daily-attendance-table";
import { LeaveRequestsList } from "./_components/leave-requests-list";
import { AttendanceHeaderActions } from "./_components/attendance-header-actions";

export default async function AdminAttendancePage() {
  // TODO: Replace with actual PostgreSQL queries using your sql tag
  // e.g., const [kpis] = await db`SELECT ...`

  const mockKpis: AttendanceKpiData = {
    totalEmployees: 42,
    presentToday: 38,
    lateToday: 2,
    absentToday: 1,
    onLeaveToday: 1,
  };

  const mockDailyLogs: DailyAttendanceRow[] = [
    {
      id: "1",
      employeeName: "Sarah Jenkins",
      department: "Engineering",
      imageUrl: null,
      status: "Present",
      checkInTime: "08:55 AM",
      checkOutTime: null,
      workHours: "4h 30m",
    },
    {
      id: "2",
      employeeName: "Marcus Chen",
      department: "Design",
      imageUrl: null,
      status: "Late",
      checkInTime: "09:45 AM",
      checkOutTime: null,
      workHours: "3h 40m",
    },
    {
      id: "3",
      employeeName: "Elena Rodriguez",
      department: "Marketing",
      imageUrl: null,
      status: "On Leave",
      checkInTime: null,
      checkOutTime: null,
      workHours: null,
    },
    {
      id: "4",
      employeeName: "James Wilson",
      department: "Engineering",
      imageUrl: null,
      status: "Absent",
      checkInTime: null,
      checkOutTime: null,
      workHours: null,
    },
  ];

  const mockLeaveRequests: LeaveRequestRow[] = [
    {
      id: "req_1",
      employeeName: "Alex Thompson",
      imageUrl: null,
      leaveType: "Annual Vacation",
      startDate: "Aug 15",
      endDate: "Aug 22",
      days: 7,
      status: "Pending",
    },
    {
      id: "req_2",
      employeeName: "Maria Garcia",
      imageUrl: null,
      leaveType: "Sick Leave",
      startDate: "Tomorrow",
      endDate: "Tomorrow",
      days: 1,
      status: "Pending",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
      {/* Header Banner with Interactive Client Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Time & Attendance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitor daily workforce availability and manage time-off requests
            across Yad Corp.
          </p>
        </div>

        {/* Client Component for Date Picker & Export */}
        <AttendanceHeaderActions logs={mockDailyLogs} />
      </div>

      {/* KPI Overviews */}
      <AttendanceKpiCards stats={mockKpis} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Log Table) */}
        <div className="lg:col-span-2 space-y-8 h-full">
          {/* Client Component Table with Built-in Search & Filters */}
          <DailyAttendanceTable logs={mockDailyLogs} />
        </div>

        {/* Right Column (Approvals) */}
        <div className="space-y-8">
          <LeaveRequestsList requests={mockLeaveRequests} />
        </div>
      </div>
    </div>
  );
}
