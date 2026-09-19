// @/app/(employee)/my-profile/attendance/(overview)/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getAttendanceData,
  getColleaguesForLeave,
  getPendingExchanges,
} from "@/app/lib/employeeDashboard/attendance/attendance";

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
  DashboardControls,
} from "@/app/ui/employee/my-attendance/my-attendance";
import {
  TodayStatusSkeleton,
  StatsGridSkeleton,
  CalendarSkeleton,
  LogTableSkeleton,
} from "@/app/ui/employee/my-attendance/skeletons";

async function AttendanceContent({
  userId,
  targetMonth,
}: {
  userId: string;
  targetMonth?: string;
}) {
  // Execute all three database fetchers in parallel for maximum speed
  const [data, colleagues, pendingExchanges] = await Promise.all([
    getAttendanceData(userId, targetMonth),
    getColleaguesForLeave(userId),
    getPendingExchanges(userId),
  ]);

  return (
    <>
      <TodayStatusCard
        data={data.today}
        workingDays={data.workingDays}
        overrides={data.overrides}
      />
      <AttendanceStatsGrid
        summary={data.summary}
        leaveBalance={data.leaveBalance}
      />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttendanceCalendar
            key={targetMonth}
            logs={data.attendanceLog}
            workingDays={data.workingDays}
            overrides={data.overrides}
            month={data.currentMonth}
            year={data.currentYear}
          />
        </div>
        <div className="xl:col-span-1 space-y-4">
          <PendingExchangesWidget requests={pendingExchanges} />
          <ShiftSummaryCard data={data.today} />
          <LeaveBalanceCard leaveBalance={data.leaveBalance} />
        </div>
      </div>

      <AttendanceLogTable
        key={targetMonth}
        logs={data.attendanceLog}
        overrides={data.overrides}
        workingDays={data.workingDays}
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

export default async function EmployeeAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const resolvedParams = await searchParams;
  const targetMonth = resolvedParams.month;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <SectionHeader
        title="My Attendance & Schedule"
        description="Track your daily check-ins, view attendance history, and manage your schedule."
        action={<DashboardControls />}
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
        <AttendanceContent userId={session.user.id} targetMonth={targetMonth} />
      </Suspense>
    </main>
  );
}
