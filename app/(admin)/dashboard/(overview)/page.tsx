// app/(admin)/dashboard/page.tsx
import { Suspense } from "react";
import { Card } from "@/app/ui/dashboard/cards";
import { RetentionEngagementChart } from "@/app/ui/dashboard/line-chart";
import { QuickOperationsWidget } from "@/app/ui/dashboard/quick-operations";
import { lusitana } from "@/app/ui/fonts";
import {
  RetentionEngagementChartSkeleton,
  EmployeeActivitySkeleton,
} from "@/app/ui/skeletons";

export default async function Page() {
  const titles = [
    "Total HeadCount",
    "Open Positions",
    "Pending Requests",
    "Avg. Attendance Rate",
  ];

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Admin Dashboard Header */}
      <div className="border-b border-slate-100 pb-5 text-left">
        <h1
          className={`${lusitana.className} text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900`}
        >
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics and company workforce analytics trends.
        </p>
      </div>

      {/* Top Summary Cards Grid */}
      <Suspense>
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
      </Suspense>

      {/* Main Analytics & Operations Content Layout */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Retention & Engagement Line Chart Panel */}
        <div className="xl:col-span-2 flex flex-col justify-between w-full">
          <Suspense fallback={<RetentionEngagementChartSkeleton />}>
            <RetentionEngagementChart />
          </Suspense>
        </div>

        {/* Admin Quick Operations Widget Panel */}
        <Suspense fallback={<EmployeeActivitySkeleton />}>
          <QuickOperationsWidget isAdmin={true} />
        </Suspense>
      </div>
    </main>
  );
}
