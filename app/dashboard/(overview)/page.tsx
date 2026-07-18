//Don't forget to add Suspense for the components taht fetch data

import { Card } from "@/app/ui/dashboard/cards";
import { RetentionEngagementChart } from "@/app/ui/dashboard/line-chart";
import { WorkingDaysCalendar } from "@/app/ui/dashboard/calendar"; // Ensure correct import path
import { lusitana } from "@/app/ui/fonts";
import { getCurrentUserRole } from "@/app/lib/data";
import { Suspense } from "react";
import { RetentionEngagementChartSkeleton } from "@/app/ui/skeletons";
import { QuickOperationsWidget } from "@/app/ui/dashboard/quick-operations";

export default async function Page() {
  // 1. Fetch current user role securely on the server
  const role = await getCurrentUserRole();
  const isAdmin = role === "admin";

  const titles = [
    "Total HeadCount",
    "Open Positions",
    "Pending Requests",
    "Avg. Attendance Rate",
  ];

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Dashboard Title Header */}
      <div className="border-b border-slate-100 pb-5 text-left">
        <h1
          className={`${lusitana.className} text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900`}
        >
          {isAdmin ? "Dashboard Overview" : "My Workspace"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isAdmin
            ? "Real-time metrics and company workforce analytics trends."
            : "Your personal operational summary and active schedules."}
        </p>
      </div>

      {/* Top Summary Cards Grid - Optimized for Mobile Thumb Scrolling */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title={titles[0]}
          value="247"
          type="users"
          trend={
            <span className="text-emerald-600 font-semibold text-xs">
              +4.5% This month
            </span>
          }
        />
        <Card
          title={titles[1]}
          value="18"
          type="positions"
          trend={
            <span className="text-emerald-600 font-semibold text-xs">
              +2 This month
            </span>
          }
        />
        <Card
          title={titles[2]}
          value="34"
          type="pending"
          trend={
            <span className="text-emerald-600 font-semibold text-xs">
              +9 Pending
            </span>
          }
        />
        <Card
          title={titles[3]}
          value="48"
          type="attendance"
          trend={
            <span className="text-emerald-600 font-semibold text-xs">
              +3% This Season
            </span>
          }
        />
      </div>

      {/* Main Analytics & Schedule Content Layout */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Conditional Panel: Admins see the Line Chart, Employees see the Working Days Calendar */}
        <div className="xl:col-span-2 flex flex-col justify-between w-full">
          <Suspense fallback={<RetentionEngagementChartSkeleton />}>
            {isAdmin ? (
              <RetentionEngagementChart />
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col">
                <div className="mb-4 text-left">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Working Days Schedule
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track your assigned dynamic shifts and logged workdays.
                  </p>
                </div>
                <WorkingDaysCalendar />
              </div>
            )}
          </Suspense>
        </div>

        {/* Right Sidebar Widget Panel */}
        <QuickOperationsWidget isAdmin={isAdmin} />
      </div>
    </main>
  );
}
