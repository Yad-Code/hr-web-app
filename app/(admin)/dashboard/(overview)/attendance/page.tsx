// @/app/(admin)/dashboard/(overview)/attendance/page.tsx
import { auth } from "@/auth";
import { getAttendanceDashboardData } from "@/app/lib/attendance/data";
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
  if (!session?.user?.id) return null;

  const resolvedParams = await searchParams;
  const targetDate =
    resolvedParams.date || new Date().toISOString().split("T")[0];
 
  const {
    kpis,
    dailyLogs,
    leaveRequests,
    shifts,
    employeesList,
    canApproveLeaves,
  } = await getAttendanceDashboardData(targetDate, session.user.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Team Attendance & Activity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Workforce availability, shift policies, and time tracking.
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
            currentUser={{ canApproveLeaves }}
          />
          <ShiftRulesCard shifts={shifts} />
        </div>
      </div>
    </div>
  );
}
