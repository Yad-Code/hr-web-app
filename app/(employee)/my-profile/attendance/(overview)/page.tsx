import { Suspense } from "react";
import { auth } from "@/auth";
import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { getAttendanceData } from "@/app/lib/employeeDashboard/attendance/attendance";
import {
  TodayStatusCard,
  AttendanceStatsGrid,
  AttendanceCalendar,
  ShiftSummaryCard,
  LeaveBalanceCard,
  AttendanceLogTable,
  AbsenceRequestModal,
  SectionHeader,
  PendingExchangesWidget,
  PendingExchangeRequest,
} from "@/app/ui/employee/my-attendance/my-attendance";
import {
  TodayStatusSkeleton,
  StatsGridSkeleton,
  CalendarSkeleton,
  LogTableSkeleton,
} from "@/app/ui/employee/my-attendance/skeletons";
import { Download } from "lucide-react";

function ExportButton() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer"
    >
      <Download className="w-4 h-4 text-slate-500" />
      <span>Export Report</span>
    </button>
  );
}

async function AttendanceContent({ userId }: { userId: string }) {
  const data = await getAttendanceData(userId);

  const userProfile =
    await sql`SELECT department FROM users WHERE id = ${userId}`;
  const userDept = userProfile[0]?.department;

  // UPDATED: Fetch working_days array for each colleague
  const colleaguesQuery = await sql`
    SELECT id, name, job_title, working_days 
    FROM users 
    WHERE role = 'employee' 
      AND id != ${userId}
      AND department = ${userDept}
    ORDER BY name ASC
  `;

  const colleagues = colleaguesQuery as unknown as {
    id: string;
    name: string;
    job_title: string | null;
    working_days: number[];
  }[];

  const pendingExchangesQuery = await sql`
    SELECT r.id, r.original_date, r.exchange_date, r.reason, u.name as requester_name
    FROM leave_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.helper_id = ${userId} AND r.helper_status = 'Pending'
  `;
  const pendingExchanges =
    pendingExchangesQuery as unknown as PendingExchangeRequest[];

  return (
    <>
      <TodayStatusCard data={data.today} />
      <AttendanceStatsGrid
        summary={data.summary}
        leaveBalance={data.leaveBalance}
      />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttendanceCalendar
            logs={data.attendanceLog}
            workingDays={data.workingDays}
            overrides={data.overrides}
          />
        </div>
        <div className="xl:col-span-1 space-y-4">
          <PendingExchangesWidget requests={pendingExchanges} />
          <ShiftSummaryCard data={data.today} />
          <LeaveBalanceCard leaveBalance={data.leaveBalance} />
        </div>
      </div>
 
      <AttendanceLogTable
        logs={data.attendanceLog}
        overrides={data.overrides}
        month={data.currentMonth}
        year={data.currentYear}
      />
 
      <AbsenceRequestModal
        leaveBalance={data.leaveBalance}
        colleagues={colleagues}
        workingDays={data.workingDays}
      />
    </>
  );
}

export default async function EmployeeAttendancePage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="p-6 text-center text-slate-500">
        Unauthorized: Please log in.
      </div>
    );
  }

  // 1. Resolve actual Postgres UUID using verified email
  const userQuery = await sql`
    SELECT id FROM users WHERE email = ${session.user.email}
  `;

  if (!userQuery || userQuery.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        User not found in database.
      </div>
    );
  }

  const dbUserId = userQuery[0].id;

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <SectionHeader
        title="My Attendance & Schedule"
        description="Track your daily check-ins, view attendance history, and manage your schedule."
        action={<ExportButton />}
      />

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
        <AttendanceContent userId={dbUserId} />
      </Suspense>
    </main>
  );
}
