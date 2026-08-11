// @/app/(admin)/dashboard/(overview)/performance/page.tsx
import { Suspense } from "react";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { PerformanceKpiCards } from "./_components/performance-kpi-cards";
import { RecentReviewsList } from "./_components/recent-reviews-list";
import { GoalTrackerList } from "./_components/goal-tracker-list";
import { UpcomingSyncsList } from "./_components/upcoming-syncs-list";
import { ReviewRow, GoalRow, MeetingRow, PerformanceKpiData } from "./types";
import Link from "next/link";
import { Plus } from "lucide-react";

export const revalidate = 0;

// --- DATA FETCHING WRAPPER COMPONENTS ---

async function KpiSection() {
  
  const [[avgResult], [reviewsCount], [goalsCount], [selfCount]] =
    await Promise.all([
      db`SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) as avg_rating FROM performance_reviews`,
      db`SELECT COUNT(*) FILTER (WHERE status = 'Completed') as completed, COUNT(*) FILTER (WHERE status = 'Pending' OR status = 'Scheduled') as pending FROM performance_reviews`,
      db`SELECT COUNT(*) FILTER (WHERE status = 'In Progress') as active FROM user_goals`,
      db`SELECT COUNT(*) as submitted FROM self_assessments WHERE submitted = true`,
    ]);

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

async function ReviewsSection() {
  const recentReviews = (await db`
    SELECT pr.id, pr.period, pr.date, pr.reviewer, pr.rating, pr.status, u.name as employee_name, u.department, u.image_url
    FROM performance_reviews pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.date DESC LIMIT 5
  `) as unknown as ReviewRow[];

  return <RecentReviewsList reviews={recentReviews} />;
}

async function GoalsSection() {
  const teamGoals = (await db`
    SELECT ug.id, ug.title, ug.progress, ug.priority, ug.due_date, ug.status, u.name as employee_name
    FROM user_goals ug
    JOIN users u ON ug.user_id = u.id
    WHERE ug.status != 'Completed'
    ORDER BY ug.due_date ASC LIMIT 5
  `) as unknown as GoalRow[];

  return <GoalTrackerList goals={teamGoals} />;
}

async function MeetingsSection() {
  const upcomingMeetings = (await db`
    SELECT m.id, m.meeting_date, m.topic, m.status, u.name as employee_name, u.department
    FROM one_on_one_meetings m
    JOIN users u ON m.employee_id = u.id
    ORDER BY m.meeting_date ASC LIMIT 4
  `) as unknown as MeetingRow[];

  return <UpcomingSyncsList meetings={upcomingMeetings} />;
}

// --- SKELETON LOADERS ---
function KpiSkeleton() {
  return (
    <div className="h-24 w-full bg-slate-100 rounded-2xl animate-pulse"></div>
  );
}
function ListSkeleton() {
  return (
    <div className="h-64 w-full bg-slate-100 rounded-2xl animate-pulse"></div>
  );
}

// --- MAIN PAGE LAYOUT ---
export default function AdminPerformancePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Performance & Talent Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor team-wide review cycles, goal progression, and 1-on-1 syncs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/performance/goals/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </Link>
          <Link
            href="/dashboard/performance/reviews/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Start Review Cycle
          </Link>
        </div>
      </div>

      <Suspense fallback={<KpiSkeleton />}>
        <KpiSection />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={<ListSkeleton />}>
            <ReviewsSection />
          </Suspense>
          <Suspense fallback={<ListSkeleton />}>
            <GoalsSection />
          </Suspense>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<ListSkeleton />}>
            <MeetingsSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
