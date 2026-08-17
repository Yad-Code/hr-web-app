// app/(admin)/dashboard/page.tsx
import { Suspense } from "react";
import AdminCardsWrapper from "@/app/ui/dashboard/cards-wrapper";
import AdminChartWrapper from "@/app/ui/dashboard/chart-wrapper"; // 1. Import the new chart wrapper
import { QuickOperationsWidget } from "@/app/ui/dashboard/quick-operations";
import { lusitana } from "@/app/ui/fonts";
import {
  RetentionEngagementChartSkeleton,
  EmployeeActivitySkeleton,
  CardsGridSkeleton,
} from "@/app/ui/skeletons";

export default async function Page() {
  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
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

      <Suspense fallback={<CardsGridSkeleton />}>
        <AdminCardsWrapper />
      </Suspense>
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col justify-between w-full">
          <Suspense fallback={<RetentionEngagementChartSkeleton />}>
            <AdminChartWrapper />
          </Suspense>
        </div>

        <Suspense fallback={<EmployeeActivitySkeleton />}>
          <QuickOperationsWidget isAdmin={true} />
        </Suspense>
      </div>
    </main>
  );
}
