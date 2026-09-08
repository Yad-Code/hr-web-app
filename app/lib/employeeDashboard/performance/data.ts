// @/app/lib/employeeDashboard/performance/data.ts

import { sql } from "@/app/lib/employeeDashboard/employee/db";

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

export async function getManager(userId: string) {
  const rows = await sql<Colleague[]>`
    SELECT m.name, m.email, m.job_title as role
    FROM users u
    JOIN users m ON u.manager_name = m.name
    WHERE u.id = ${userId}
  `;

  return rows[0] ?? null;
}

export async function getPerformanceProfile(userId: string) {
  const rows = await sql<PerformanceProfile[]>`
    SELECT *
    FROM user_performance
    WHERE user_id=${userId}
  `;

  return rows[0] ?? null;
}

export async function getUserKPIs(userId: string) {
  const [kpiRows, attendanceStats] = await Promise.all([
    sql<KPI[]>`
      SELECT *
      FROM user_kpis
      WHERE user_id = ${userId}
    `,

    sql<{ total_days: number; present_days: number; on_time_days: number }[]>`
      WITH target_user AS (
        SELECT id, COALESCE(working_days, '{1,2,3,4,5}'::int[]) as working_days 
        FROM users WHERE id = ${userId}
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
        WHERE user_id = ${userId} AND date >= DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT 
        (SELECT COUNT(*) FROM scheduled_days)::int AS total_days,
        (SELECT COUNT(*) FROM actual_attendance WHERE status IN ('Present', 'Late'))::int AS present_days,
        (SELECT COUNT(*) FROM actual_attendance WHERE status = 'Present')::int AS on_time_days
    `,
  ]);

  const stats = attendanceStats[0];
  const totalDays = stats?.total_days || 0;
  const presentDays = stats?.present_days || 0;
  const onTimeDays = stats?.on_time_days || 0;

  const dynamicAttendanceRate =
    totalDays > 0 ? `${((presentDays / totalDays) * 100).toFixed(1)}%` : "0.0%";

  const dynamicPunctualityRate =
    presentDays > 0
      ? `${((onTimeDays / presentDays) * 100).toFixed(1)}%`
      : "0.0%";

  return kpiRows.map((kpi) => {
    const label = kpi.label.toLowerCase();

    if (label.includes("attendance")) {
      return { ...kpi, value: dynamicAttendanceRate };
    } 
    if (label.includes("on-time")) {
      return { ...kpi, value: dynamicPunctualityRate };
    }
    return kpi;
  });
}

export async function getUserGoals(userId: string) {
  return sql<Goal[]>`
    SELECT *
    FROM user_goals
    WHERE user_id=${userId}
    ORDER BY due_date
  `;
}

export async function getPerformanceReviews(userId: string) {
  return sql<PerformanceReview[]>`
    SELECT *
    FROM performance_reviews
    WHERE user_id=${userId}
    ORDER BY date DESC
  `;
}

export async function getUserSkills(userId: string) {
  return sql<Skill[]>`
    SELECT *
    FROM skills
    WHERE user_id=${userId}
  `;
}

export async function getUserFeedback(userId: string) {
  return sql<Feedback[]>`
    SELECT *
    FROM user_feedback
    WHERE user_id=${userId}
    ORDER BY date DESC
  `;
}

export async function getCareerDevelopment(userId: string) {
  const rows = await sql<CareerDevelopment[]>`
    SELECT *
    FROM career_development
    WHERE user_id=${userId}
  `;

  return rows[0] ?? null;
}

export async function getOneOnOneMeetings(userId: string) {
  return sql<OneOnOneMeeting[]>`
    SELECT
      m.*,
      u.name AS manager_name
    FROM one_on_one_meetings m
    LEFT JOIN users u
      ON u.id = m.manager_id
    WHERE m.employee_id=${userId}
    ORDER BY meeting_date DESC
  `;
}

export async function getPerformanceNotifications(userId: string) {
  return sql<PerformanceNotification[]>`
    SELECT *
    FROM performance_notifications
    WHERE user_id=${userId}
    ORDER BY created_at DESC
  `;
}

export async function getPerformanceHistory(userId: string) {
  return sql<PerformanceHistory[]>`
    SELECT *
    FROM performance_history
    WHERE user_id=${userId}
    ORDER BY month
  `;
}

export async function getSelfAssessment(userId: string) {
  const rows = await sql<SelfAssessment[]>`
    SELECT *
    FROM self_assessments
    WHERE user_id=${userId}
  `;

  return rows[0] ?? null;
}

export async function getPerformanceDashboard(userId: string) {
  const [
    profile,
    kpis,
    goals,
    reviews,
    skills,
    feedback,
    career,
    meetings,
    notifications,
    history,
    selfAssessment,
    manager,
  ] = await Promise.all([
    getPerformanceProfile(userId),
    getUserKPIs(userId),
    getUserGoals(userId),
    getPerformanceReviews(userId),
    getUserSkills(userId),
    getUserFeedback(userId),
    getCareerDevelopment(userId),
    getOneOnOneMeetings(userId),
    getPerformanceNotifications(userId),
    getPerformanceHistory(userId),
    getSelfAssessment(userId),
    getManager(userId),
  ]);

  return {
    profile,
    kpis,
    goals,
    reviews,
    skills,
    feedback,
    career,
    meetings,
    notifications,
    history,
    selfAssessment,
    manager,
  };
}
