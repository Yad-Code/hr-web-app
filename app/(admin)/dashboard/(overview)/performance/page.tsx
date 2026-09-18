// @/app/(admin)/dashboard/(overview)/performance/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { getPerformanceDashboardData } from "@/app/lib/admin/performance/data";

import { AdminPerformanceControls } from "./_components/admin-performance-controls";
import { PerformanceKpiCards } from "./_components/performance-kpi-cards";
import { RecentReviewsList } from "./_components/recent-reviews-list";
import { GoalTrackerList } from "./_components/goal-tracker-list";
import { UpcomingSyncsList } from "./_components/upcoming-syncs-list";
import { FeedbackWidget } from "./_components/feedback-widget";

export const revalidate = 0;

function ListSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden h-64 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

export default async function AdminPerformancePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // 1. Unified ABAC Data Fetch
  const data = await getPerformanceDashboardData(session.user.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {data.isGlobalAdmin ? "Company Performance" : "Team Performance"}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {data.isGlobalAdmin
              ? "Monitor enterprise-wide review cycles, goal progression, and 1-on-1 syncs"
              : "Monitor your team's review cycles, goal progression, and 1-on-1 syncs"}
          </p>
        </div>

        {/* Pass the dynamic ABAC flags down instead of user object */}
        <AdminPerformanceControls
          canLogFeedback={true} // Usually everyone can log feedback
          canStartReviews={data.isGlobalAdmin} // For simplicity here, or check verifyAccess
          isGlobalAdmin={data.isGlobalAdmin}
        />
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <PerformanceKpiCards stats={data.kpiStats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ListSkeleton />}>
            <RecentReviewsList reviews={data.recentReviews} />
          </Suspense>
          <Suspense fallback={<ListSkeleton />}>
            <GoalTrackerList goals={data.teamGoals} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<ListSkeleton />}>
            <UpcomingSyncsList meetings={data.upcomingSyncs} />
          </Suspense>

          <Suspense fallback={<ListSkeleton />}>
            <FeedbackWidget
              feedback={data.recentFeedback}
              requests={data.pendingRequests}
              isAdmin={data.isGlobalAdmin}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
