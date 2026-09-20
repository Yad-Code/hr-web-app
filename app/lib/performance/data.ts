// @/app/lib/performance/data.ts

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";
import { PerformanceKpiData } from "@/app/lib/employeeDashboard/performance/definitions";

const authUsersCTE = (actorId: string) => db`
  WITH params AS (
    SELECT ${actorId}::uuid AS actor_id
  ),
  auth_users AS (
    SELECT DISTINCT u.id FROM users u
    CROSS JOIN params
    JOIN user_permissions up ON up.user_id = params.actor_id
    JOIN permissions p ON p.id = up.permission_id
    WHERE p.action IN ('view_dashboard', 'start_reviews', 'log_feedback')
      AND (
        up.scope = 'global' OR
        (up.scope = 'branch' AND u.branch = up.target_branch) OR
        (up.scope = 'department' AND u.department = up.target_department) OR
        (up.scope = 'team' AND u.manager_id = params.actor_id) OR
        (up.scope = 'self' AND u.id = params.actor_id)
      )
  )
`;

export async function getPerformanceKPIs(): Promise<PerformanceKpiData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const kpiRes = await db`
    ${authUsersCTE(userId)}
    SELECT 
      (SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) FROM performance_reviews WHERE user_id IN (SELECT id FROM auth_users)) as avg_rating,
      (SELECT COUNT(*) FROM performance_reviews WHERE status = 'Completed' AND user_id IN (SELECT id FROM auth_users)) as completed_reviews,
      (SELECT COUNT(*) FROM performance_reviews WHERE status IN ('Pending', 'Scheduled') AND user_id IN (SELECT id FROM auth_users)) as pending_reviews,
      (SELECT COUNT(*) FROM user_goals WHERE status = 'In Progress' AND user_id IN (SELECT id FROM auth_users)) as active_goals,
      (SELECT COUNT(*) FROM self_assessments WHERE submitted = true AND user_id IN (SELECT id FROM auth_users)) as submitted_assessments
  `;

  const today = new Date();
  const quarter = Math.floor(today.getMonth() / 3) + 1;
  const currentQuarter = `Q${quarter} ${today.getFullYear()}`;

  return {
    avgRating: String(kpiRes[0]?.avg_rating ?? "0.0"),
    completedReviews: String(kpiRes[0]?.completed_reviews ?? "0"),
    pendingReviews: String(kpiRes[0]?.pending_reviews ?? "0"),
    activeGoals: String(kpiRes[0]?.active_goals ?? "0"),
    submittedAssessments: String(kpiRes[0]?.submitted_assessments ?? "0"),
    currentQuarter,
  };
}
