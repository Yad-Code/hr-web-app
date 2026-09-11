// @/app/(admin)/dashboard/(overview)/performance/page.tsx
import { Suspense } from "react";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";
import { getCompanyFeedback } from "@/app/lib/admin/performance/data";

import { AdminPerformanceControls } from "./_components/admin-performance-controls";
import { PerformanceKpiCards } from "./_components/performance-kpi-cards";
import { RecentReviewsList } from "./_components/recent-reviews-list";
import { GoalTrackerList } from "./_components/goal-tracker-list";
import { UpcomingSyncsList } from "./_components/upcoming-syncs-list";
import { FeedbackWidget } from "./_components/feedback-widget";

import {
  ReviewRow,
  GoalRow,
  FeedbackRow,
  FeedbackRequestRow,
  MeetingRow,
} from "./types";
import { getPerformanceKPIs } from "@/app/lib/performance/data";

export const revalidate = 0;

async function FeedbackSection({
  isAdmin,
  managerName,
}: {
  isAdmin: boolean;
  managerName: string;
}) {
  const allFeedback = (await getCompanyFeedback()) as unknown as FeedbackRow[];
  const recentFeedback = allFeedback.slice(0, 5);

  let pendingRequests;

  // 2. Keep the pending requests query as it targets a completely different table
  if (isAdmin) {
    pendingRequests = (await db`
      SELECT id, title, description, created_at 
      FROM performance_notifications 
      WHERE type = 'Feedback Request' AND is_read = false
      ORDER BY created_at DESC LIMIT 5
    `) as unknown as FeedbackRequestRow[];
  } else {
    pendingRequests = (await db`
      SELECT pn.id, pn.title, pn.description, pn.created_at 
      FROM performance_notifications pn JOIN users u ON pn.user_id = u.id
      WHERE pn.type = 'Feedback Request' AND pn.is_read = false 
      AND (u.name = ${managerName} OR u.manager_name = ${managerName})
      ORDER BY pn.created_at DESC LIMIT 5
    `) as unknown as FeedbackRequestRow[];
  }

  return (
    <FeedbackWidget
      feedback={recentFeedback}
      requests={pendingRequests}
      isAdmin={isAdmin}
    />
  );
}

async function KpiSection({
  isAdmin,
  managerName,
}: {
  isAdmin: boolean;
  managerName: string;
}) {
  const kpiStats = await getPerformanceKPIs(isAdmin, managerName);

  return <PerformanceKpiCards stats={kpiStats} />;
}

async function ReviewsSection({
  isAdmin,
  managerName,
}: {
  isAdmin: boolean;
  managerName: string;
}) {
  let recentReviews;
  if (isAdmin) {
    recentReviews = (await db`
      SELECT pr.id, pr.period, pr.date, pr.reviewer, pr.rating, pr.status, u.name as employee_name, u.department, u.image_url
      FROM performance_reviews pr JOIN users u ON pr.user_id = u.id
      ORDER BY pr.date DESC LIMIT 5
    `) as unknown as ReviewRow[];
  } else {
    recentReviews = (await db`
      SELECT pr.id, pr.period, pr.date, pr.reviewer, pr.rating, pr.status, u.name as employee_name, u.department, u.image_url
      FROM performance_reviews pr JOIN users u ON pr.user_id = u.id
      WHERE u.manager_name = ${managerName}
      ORDER BY pr.date DESC LIMIT 5
    `) as unknown as ReviewRow[];
  }

  return <RecentReviewsList reviews={recentReviews} />;
}

async function GoalsSection({
  isAdmin,
  managerName,
}: {
  isAdmin: boolean;
  managerName: string;
}) {
  let teamGoals;
  if (isAdmin) {
    teamGoals = (await db`
      SELECT ug.id, ug.title, ug.progress, ug.priority, ug.due_date, ug.status, u.name as employee_name
      FROM user_goals ug JOIN users u ON ug.user_id = u.id
      WHERE ug.status != 'Completed'
      ORDER BY ug.due_date ASC LIMIT 5
    `) as unknown as GoalRow[];
  } else {
    teamGoals = (await db`
      SELECT ug.id, ug.title, ug.progress, ug.priority, ug.due_date, ug.status, u.name as employee_name
      FROM user_goals ug JOIN users u ON ug.user_id = u.id
      WHERE ug.status != 'Completed' AND u.manager_name = ${managerName}
      ORDER BY ug.due_date ASC LIMIT 5
    `) as unknown as GoalRow[];
  }

  return <GoalTrackerList goals={teamGoals} />;
}

async function MeetingsSection({
  isAdmin,
  managerName,
}: {
  isAdmin: boolean;
  managerName: string;
}) {
  let upcomingSyncs;
  if (isAdmin) {
    upcomingSyncs = (await db`
      SELECT m.id, m.meeting_date, m.topic, m.status, u.name as employee_name, u.department
      FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
      WHERE m.status != 'Completed'
      ORDER BY m.meeting_date ASC LIMIT 5
    `) as unknown as MeetingRow[];
  } else {
    upcomingSyncs = (await db`
      SELECT m.id, m.meeting_date, m.topic, m.status, u.name as employee_name, u.department
      FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
      WHERE m.status != 'Completed' AND u.manager_name = ${managerName}
      ORDER BY m.meeting_date ASC LIMIT 5
    `) as unknown as MeetingRow[];
  }

  return <UpcomingSyncsList meetings={upcomingSyncs} />;
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs h-22 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse"></div>
            <div className="h-5 w-1/2 bg-slate-100 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-100">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="h-5 w-1/3 bg-slate-200/60 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-slate-200/60 rounded animate-pulse"></div>
      </div>
      <div className="p-4 space-y-5 flex-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0"></div>
            <div className="flex-1 space-y-2.5">
              <div className="flex justify-between items-center w-full">
                <div className="h-3.5 w-1/3 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-12 bg-slate-100 rounded-md animate-pulse"></div>
              </div>
              <div className="h-2.5 w-1/2 bg-slate-100 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminPerformancePage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.isAdmin;
  const isManager = session.user.isManager;
  const managerName = session.user.name as string;

  if (!isAdmin && !isManager) {
    return <div className="p-6 text-slate-500">Access Denied.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? "Company Performance" : "Team Performance"}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isAdmin
              ? "Monitor enterprise-wide review cycles, goal progression, and 1-on-1 syncs"
              : "Monitor your team's review cycles, goal progression, and 1-on-1 syncs"}
          </p>
        </div>
 
        <AdminPerformanceControls user={session.user} />
      </div>

      <Suspense fallback={<KpiSkeleton />}>
        <KpiSection isAdmin={isAdmin} managerName={managerName} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ListSkeleton />}>
            <ReviewsSection isAdmin={isAdmin} managerName={managerName} />
          </Suspense>
          <Suspense fallback={<ListSkeleton />}>
            <GoalsSection isAdmin={isAdmin} managerName={managerName} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<ListSkeleton />}>
            <MeetingsSection isAdmin={isAdmin} managerName={managerName} />
          </Suspense>

          <Suspense fallback={<ListSkeleton />}>
            <FeedbackSection isAdmin={isAdmin} managerName={managerName} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
