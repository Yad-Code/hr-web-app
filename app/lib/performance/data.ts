import { sql } from "@/app/lib/employeeDashboard/employee/db";

import { PerformanceKpiData } from "@/app/(admin)/dashboard/(overview)/performance/types";

export async function getPerformanceKPIs(
  isAdmin: boolean,
  managerName: string,
): Promise<PerformanceKpiData> {
  let avgResult, reviewsCount, goalsCount, selfCount;

  if (isAdmin) {
    [[avgResult], [reviewsCount], [goalsCount], [selfCount]] =
      await Promise.all([
        sql`SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) as avg_rating FROM performance_reviews`,
        sql`SELECT COUNT(*) FILTER (WHERE status = 'Completed') as completed, COUNT(*) FILTER (WHERE status = 'Pending' OR status = 'Scheduled') as pending FROM performance_reviews`,
        sql`SELECT COUNT(*) FILTER (WHERE status = 'In Progress') as active FROM user_goals`,
        sql`SELECT COUNT(*) as submitted FROM self_assessments WHERE submitted = true`,
      ]);
  } else {
    [[avgResult], [reviewsCount], [goalsCount], [selfCount]] =
      await Promise.all([
        sql`SELECT COALESCE(ROUND(AVG(pr.rating), 1), 0.0) as avg_rating FROM performance_reviews pr JOIN users u ON pr.user_id = u.id WHERE u.manager_name = ${managerName}`,
        sql`SELECT COUNT(*) FILTER (WHERE pr.status = 'Completed') as completed, COUNT(*) FILTER (WHERE pr.status = 'Pending' OR pr.status = 'Scheduled') as pending FROM performance_reviews pr JOIN users u ON pr.user_id = u.id WHERE u.manager_name = ${managerName}`,
        sql`SELECT COUNT(*) FILTER (WHERE ug.status = 'In Progress') as active FROM user_goals ug JOIN users u ON ug.user_id = u.id WHERE u.manager_name = ${managerName}`,
        sql`SELECT COUNT(*) as submitted FROM self_assessments sa JOIN users u ON sa.user_id = u.id WHERE sa.submitted = true AND u.manager_name = ${managerName}`,
      ]);
  }

  const today = new Date();
  const quarter = Math.floor(today.getMonth() / 3) + 1;
  const currentQuarter = `Q${quarter} ${today.getFullYear()}`;

  return {
    avgRating: String(avgResult?.avg_rating ?? "0.0"),
    completedReviews: String(reviewsCount?.completed ?? "0"),
    pendingReviews: String(reviewsCount?.pending ?? "0"),
    activeGoals: String(goalsCount?.active ?? "0"),
    submittedAssessments: String(selfCount?.submitted ?? "0"),
    currentQuarter,
  };
}
