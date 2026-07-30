import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { ReviewRow, GoalRow, MeetingRow, PerformanceKpiData } from "./types";
import { PerformanceKpiCards } from "./_components/performance-kpi-cards";
import { RecentReviewsList } from "./_components/recent-reviews-list";
import { GoalTrackerList } from "./_components/goal-tracker-list";
import { UpcomingSyncsList } from "./_components/upcoming-syncs-list";

export const revalidate = 0;

export default async function AdminPerformancePage() {
  // 1. Fetch KPI Metrics
  const [avgResult] =
    await db`SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) as avg_rating FROM user_performance`;
  const [reviewsCount] = await db`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'Completed') as completed,
      COUNT(*) FILTER (WHERE status = 'Pending' OR status = 'Scheduled') as pending
    FROM performance_reviews
  `;
  const [goalsCount] =
    await db`SELECT COUNT(*) FILTER (WHERE status = 'In Progress') as active FROM user_goals`;
  const [selfCount] =
    await db`SELECT COUNT(*) as submitted FROM self_assessments WHERE submitted = true`;

  const kpiStats: PerformanceKpiData = {
    avgRating: String(avgResult?.avg_rating ?? "0.0"),
    completedReviews: String(reviewsCount?.completed ?? "0"),
    pendingReviews: String(reviewsCount?.pending ?? "0"),
    activeGoals: String(goalsCount?.active ?? "0"),
    submittedAssessments: String(selfCount?.submitted ?? "0"),
  };

  // 2. Fetch Lists
  const recentReviews = (await db`
    SELECT pr.id, pr.period, pr.date, pr.reviewer, pr.rating, pr.status, u.name as employee_name, u.department, u.image_url
    FROM performance_reviews pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.date DESC LIMIT 5
  `) as unknown as ReviewRow[];

  const teamGoals = (await db`
    SELECT ug.id, ug.title, ug.progress, ug.priority, ug.due_date, ug.status, u.name as employee_name
    FROM user_goals ug
    JOIN users u ON ug.user_id = u.id
    WHERE ug.status != 'Completed'
    ORDER BY ug.due_date ASC LIMIT 5
  `) as unknown as GoalRow[];

  const upcomingMeetings = (await db`
    SELECT m.id, m.meeting_date, m.topic, m.status, u.name as employee_name, u.department
    FROM one_on_one_meetings m
    JOIN users u ON m.employee_id = u.id
    ORDER BY m.meeting_date ASC LIMIT 4
  `) as unknown as MeetingRow[];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Performance & Talent Management
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Monitor team-wide review cycles, goal progression, and 1-on-1 syncs
        </p>
      </div>

      {/* KPI Cards Grid Component */}
      <PerformanceKpiCards stats={kpiStats} />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Reviews & Goals */}
        <div className="lg:col-span-2 space-y-8">
          <RecentReviewsList reviews={recentReviews} />
          <GoalTrackerList goals={teamGoals} />
        </div>

        {/* Right Column (1 span): 1-on-1s */}
        <div className="space-y-8">
          <UpcomingSyncsList meetings={upcomingMeetings} />
        </div>
      </div>
    </div>
  );
}
