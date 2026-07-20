import { Suspense } from "react";
import { auth } from "@/auth";
import { getAttendanceData } from "@/app/lib/data/attendance";
import { 
  TodayStatusCard, 
  AttendanceStatsGrid,
  AttendanceCalendar,
  ShiftSummaryCard,
  LeaveBalanceCard,
  AttendanceLogTable,
  WFHRequestModal,
  SectionHeader
} from "@/app/ui/employee/my-attendance/my-attendance";
import { 
  TodayStatusSkeleton, 
  StatsGridSkeleton,
  CalendarSkeleton,
  LogTableSkeleton 
} from "@/app/ui/employee/my-attendance/skeletons";
import { Download } from "lucide-react";

// Client/Action button for exporting logs
function ExportButton() {
  return (
    <button 
      type="button"
      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs active:scale-95"
    >
      <Download className="w-4 h-4 text-slate-500" />
      <span>Export Report</span>
    </button>
  );
}

// Inner async component to allow Suspense streaming
async function AttendanceContent({ userId }: { userId: string | undefined }) {
  const data = await getAttendanceData(userId);

  return (
    <>
      {/* Today's Status */}
      <TodayStatusCard data={data.today} />

      {/* Stats Grid */}
      <AttendanceStatsGrid 
        summary={data.summary} 
        leaveBalance={data.leaveBalance} 
      />

      {/* Calendar + Side Panel */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttendanceCalendar 
            currentMonth={data.currentMonth}
            currentYear={data.currentYear}
            calendarDays={data.calendarDays}
          />
        </div>
        <div className="xl:col-span-1 space-y-4">
          <ShiftSummaryCard data={data.today} />
          <LeaveBalanceCard leaveBalance={data.leaveBalance} />
        </div>
      </div>

      {/* Attendance Log */}
      <AttendanceLogTable 
        logs={data.attendanceLog}
        month={data.currentMonth}
        year={data.currentYear}
      />
    </>
  );
}

export default async function EmployeeAttendancePage() {
  const session = await auth();

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <SectionHeader 
        title="My Attendance & Schedule"
        description="Track your daily check-ins, view attendance history, and manage your schedule."
        action={<ExportButton />}
      />

      {/* Suspense Container for Async Data Fetching */}
      <Suspense
        fallback={
          <div className="space-y-6 sm:space-y-8">
            <TodayStatusSkeleton />
            <StatsGridSkeleton />
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <CalendarSkeleton />
              </div>
              <div className="xl:col-span-1 space-y-4">
                <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
                <div className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
              </div>
            </div>
            <LogTableSkeleton />
          </div>
        }
      >
        <AttendanceContent userId={session?.user?.id} />
      </Suspense>

      {/* WFH Modal */}
      <WFHRequestModal />
    </main>
  );
}