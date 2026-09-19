// @/app/lib/employeeDashboard/performance/data.ts
import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";
import {
  PerformanceProfile,
  KPI,
  Goal,
  PerformanceReview,
  Skill,
  Feedback,
  CareerDevelopment,
  OneOnOneMeeting,
  PerformanceNotification,
  PerformanceHistory,
  SelfAssessment,
  Colleague,
} from "./definitions";

export async function getPerformanceDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const [
    profileRows,
    kpiRows,
    attendanceStats,
    goals,
    reviews,
    skills,
    feedback,
    careerRows,
    meetings,
    notifications,
    history,
    selfAssessmentRows,
    managerRows,
  ] = await Promise.all([
    sql<
      PerformanceProfile[]
    >`SELECT * FROM user_performance WHERE user_id=${userId}::uuid`,
    sql<KPI[]>`SELECT * FROM user_kpis WHERE user_id=${userId}::uuid`,
    sql<{ total_days: number; present_days: number; on_time_days: number }[]>`
      WITH target_user AS (
        SELECT id, COALESCE(working_days, '{1,2,3,4,5}'::int[]) as working_days 
        FROM users WHERE id = ${userId}::uuid
      ),
      past_days AS (
        SELECT date::date FROM generate_series(DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE, '1 day'::interval) AS date
      ),
      expected_shifts AS (
        SELECT u.id as user_id, p.date
        FROM target_user u CROSS JOIN past_days p
        WHERE EXTRACT(DOW FROM p.date)::int = ANY(u.working_days)
      ),
      scheduled_days AS (
        SELECT e.user_id, e.date
        FROM expected_shifts e
        LEFT JOIN leave_requests lr 
          ON lr.user_id = e.user_id 
          AND lr.type = 'dayoff' 
          AND lr.status = 'Approved' 
          AND e.date BETWEEN lr.start_date AND lr.end_date
        WHERE lr.id IS NULL
      ),
      actual_attendance AS (
        SELECT date, status FROM attendance 
        WHERE user_id = ${userId}::uuid AND date >= DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT 
        COUNT(s.date)::int AS total_days,
        COUNT(a.status) FILTER (WHERE a.status IN ('Present', 'Late'))::int AS present_days,
        COUNT(a.status) FILTER (WHERE a.status = 'Present')::int AS on_time_days
      FROM scheduled_days s
      LEFT JOIN actual_attendance a ON s.date = a.date
    `,
    sql<
      Goal[]
    >`SELECT * FROM user_goals WHERE user_id=${userId}::uuid ORDER BY due_date`,
    sql<
      PerformanceReview[]
    >`SELECT * FROM performance_reviews WHERE user_id=${userId}::uuid ORDER BY date DESC`,
    sql<Skill[]>`SELECT * FROM skills WHERE user_id=${userId}::uuid`,
    sql<
      Feedback[]
    >`SELECT * FROM user_feedback WHERE user_id=${userId}::uuid ORDER BY date DESC`,
    sql<
      CareerDevelopment[]
    >`SELECT * FROM career_development WHERE user_id=${userId}::uuid`,
    sql<OneOnOneMeeting[]>`
      SELECT m.*, u.name AS manager_name
      FROM one_on_one_meetings m
      LEFT JOIN users u ON u.id = m.manager_id
      WHERE m.employee_id=${userId}::uuid ORDER BY meeting_date DESC
    `,
    sql<
      PerformanceNotification[]
    >`SELECT * FROM performance_notifications WHERE user_id=${userId}::uuid ORDER BY created_at DESC`,
    sql<
      PerformanceHistory[]
    >`SELECT * FROM performance_history WHERE user_id=${userId}::uuid ORDER BY month`,
    sql<
      SelfAssessment[]
    >`SELECT * FROM self_assessments WHERE user_id=${userId}::uuid ORDER BY submitted ASC, cycle DESC LIMIT 1`,
    sql<Colleague[]>`
      SELECT m.name, m.email, m.job_title as role
      FROM users u JOIN users m ON u.manager_id = m.id WHERE u.id = ${userId}::uuid
    `,
  ]);

  const stats = attendanceStats[0] || {
    total_days: 0,
    present_days: 0,
    on_time_days: 0,
  };

  const processedKpis = kpiRows.map((kpi) => {
    const label = kpi.label.toLowerCase();
    if (label.includes("attendance")) {
      const rate =
        stats.total_days > 0
          ? (stats.present_days / stats.total_days) * 100
          : 0;
      const target = parseFloat(kpi.target) || 95;
      const diff = rate - target;
      return {
        ...kpi,
        value: `${rate.toFixed(1)}%`,
        trend: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
        is_up: diff >= 0,
      };
    }
    if (label.includes("on-time")) {
      const rate =
        stats.present_days > 0
          ? (stats.on_time_days / stats.present_days) * 100
          : 0;
      const target = parseFloat(kpi.target) || 90;
      const diff = rate - target;
      return {
        ...kpi,
        value: `${rate.toFixed(1)}%`,
        trend: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
        is_up: diff >= 0,
      };
    }
    return kpi;
  });

  return {
    profile: profileRows[0] ?? null,
    kpis: processedKpis,
    goals,
    reviews,
    skills,
    feedback,
    career: careerRows[0] ?? null,
    meetings,
    notifications,
    history,
    selfAssessment: selfAssessmentRows[0] ?? null,
    manager: managerRows[0] ?? null,
  };
}
