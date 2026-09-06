// @/app/(admin)/dashboard/(overview)/performance/page.tsx
import { Suspense } from "react";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";

import { PerformanceKpiCards } from "./_components/performance-kpi-cards";
import { RecentReviewsList } from "./_components/recent-reviews-list";
import { GoalTrackerList } from "./_components/goal-tracker-list";
import { UpcomingSyncsList } from "./_components/upcoming-syncs-list";
import { FeedbackWidget } from "./_components/feedback-widget";

import Link from "next/link";
import { Plus, MessageSquarePlus } from "lucide-react";
import {
  ReviewRow,
  GoalRow,
  PerformanceKpiData,
  FeedbackRow,
  FeedbackRequestRow,
  MeetingRow,
} from "./types";

export const revalidate = 0;

// --- SECURED SECTIONS ---

async function FeedbackSection({
  isAdmin,
  managerName,
}: {
  isAdmin: boolean;
  managerName: string;
}) {
  let recentFeedback;
  let pendingRequests;

  if (isAdmin) {
    recentFeedback = (await db`
      SELECT uf.id, uf.type, uf.text, uf.sender, uf.role, uf.date, u.name as recipient_name, u.image_url as recipient_image
      FROM user_feedback uf JOIN users u ON uf.user_id = u.id
      ORDER BY uf.date DESC LIMIT 5
    `) as unknown as FeedbackRow[];

    pendingRequests = (await db`
      SELECT id, title, description, created_at 
      FROM performance_notifications 
      WHERE type = 'Feedback Request' AND is_read = false
      ORDER BY created_at DESC LIMIT 5
    `) as unknown as FeedbackRequestRow[];
  } else {
    recentFeedback = (await db`
      SELECT uf.id, uf.type, uf.text, uf.sender, uf.role, uf.date, u.name as recipient_name, u.image_url as recipient_image
      FROM user_feedback uf JOIN users u ON uf.user_id = u.id
      WHERE u.manager_name = ${managerName}
      ORDER BY uf.date DESC LIMIT 5
    `) as unknown as FeedbackRow[];

    pendingRequests = (await db`
      SELECT pn.id, pn.title, pn.description, pn.created_at 
      FROM performance_notifications pn JOIN users u ON pn.user_id = u.id
      WHERE pn.type = 'Feedback Request' AND pn.is_read = false AND u.manager_name = ${managerName}
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
  let avgResult, reviewsCount, goalsCount, selfCount;

  if (isAdmin) {
    [[avgResult], [reviewsCount], [goalsCount], [selfCount]] =
      await Promise.all([
        db`SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) as avg_rating FROM performance_reviews`,
        db`SELECT COUNT(*) FILTER (WHERE status = 'Completed') as completed, COUNT(*) FILTER (WHERE status = 'Pending' OR status = 'Scheduled') as pending FROM performance_reviews`,
        db`SELECT COUNT(*) FILTER (WHERE status = 'In Progress') as active FROM user_goals`,
        db`SELECT COUNT(*) as submitted FROM self_assessments WHERE submitted = true`,
      ]);
  } else {
    [[avgResult], [reviewsCount], [goalsCount], [selfCount]] =
      await Promise.all([
        db`SELECT COALESCE(ROUND(AVG(pr.rating), 1), 0.0) as avg_rating FROM performance_reviews pr JOIN users u ON pr.user_id = u.id WHERE u.manager_name = ${managerName}`,
        db`SELECT COUNT(*) FILTER (WHERE pr.status = 'Completed') as completed, COUNT(*) FILTER (WHERE pr.status = 'Pending' OR pr.status = 'Scheduled') as pending FROM performance_reviews pr JOIN users u ON pr.user_id = u.id WHERE u.manager_name = ${managerName}`,
        db`SELECT COUNT(*) FILTER (WHERE ug.status = 'In Progress') as active FROM user_goals ug JOIN users u ON ug.user_id = u.id WHERE u.manager_name = ${managerName}`,
        db`SELECT COUNT(*) as submitted FROM self_assessments sa JOIN users u ON sa.user_id = u.id WHERE sa.submitted = true AND u.manager_name = ${managerName}`,
      ]);
  }

  const today = new Date();
  const quarter = Math.floor(today.getMonth() / 3) + 1;
  const currentQuarter = `Q${quarter} ${today.getFullYear()}`;

  const kpiStats: PerformanceKpiData = {
    avgRating: String(avgResult?.avg_rating ?? "0.0"),
    completedReviews: String(reviewsCount?.completed ?? "0"),
    pendingReviews: String(reviewsCount?.pending ?? "0"),
    activeGoals: String(goalsCount?.active ?? "0"),
    submittedAssessments: String(selfCount?.submitted ?? "0"),
    currentQuarter,
  };

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

// --- SKELETON LOADERS ---

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

  const isAdmin = session.user.role === "admin";
  const managerName = session.user.name as string;

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

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs">
            <MessageSquarePlus className="w-4 h-4 text-slate-400" />
            Log Feedback
          </button>
          <Link
            href="/dashboard/performance/goals/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            New Goal
          </Link>
          <Link
            href="/dashboard/performance/reviews/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm ring-1 ring-inset ring-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Start Review Cycle
          </Link>
        </div>
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
