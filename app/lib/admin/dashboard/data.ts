// @/app/lib/admin/dashboard/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import {
  DashboardPendingRequest,
  DashboardOutToday,
  DashboardComplianceAlert,
  DashboardPayrollRun,
} from "@/app/lib/employee/definitions";
import { verifyFeatureAccess } from "@/app/lib/auth/access-control";

const authUsersCTE = (actorId: string, action: string = "view_dashboard") => db`
  WITH params AS (
    SELECT ${actorId}::uuid AS actor_id, ${action}::text AS action_name
  ),
  auth_users AS (
    SELECT DISTINCT u.id FROM users u
    CROSS JOIN params
    JOIN user_permissions up ON up.user_id = params.actor_id
    JOIN permissions p ON p.id = up.permission_id
    WHERE p.action = params.action_name
      AND (
        up.scope = 'global' OR
        (up.scope = 'branch' AND u.branch = up.target_branch) OR
        (up.scope = 'department' AND u.department = up.target_department) OR
        (up.scope = 'team' AND u.manager_id = params.actor_id) OR
        (up.scope = 'self' AND u.id = params.actor_id)
      )
  )
`;

export async function getCardsData(actorId: string) {
  try {
    // 👇 FIXED: Removed Promise.all to fetch sequentially and relieve the DB pool
    const headcountRes =
      await db`${authUsersCTE(actorId)} SELECT COUNT(*) FROM users u WHERE u.status = 'Active' AND u.id IN (SELECT id FROM auth_users)`;

    const openPosRes =
      await db`SELECT COUNT(*) FROM job_postings WHERE status = 'Open'`;

    const pendingRes =
      await db`${authUsersCTE(actorId, "update_records")} SELECT COUNT(*) as total FROM leave_requests lr WHERE lr.status ILIKE 'pending' AND lr.user_id IN (SELECT id FROM auth_users)`;

    const attendanceRes = await db`
      ${authUsersCTE(actorId)}
      , target_users AS (
        SELECT u.id as user_id, COALESCE(u.working_days, '{1,2,3,4,5}'::int[]) as working_days 
        FROM users u WHERE u.status = 'Active' AND u.id IN (SELECT id FROM auth_users)
      ),
      past_days AS (SELECT date::date FROM generate_series(DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE, '1 day'::interval) AS date),
      expected_shifts AS (
        SELECT u.user_id, p.date FROM target_users u CROSS JOIN past_days p
        WHERE EXTRACT(DOW FROM p.date)::int = ANY(u.working_days)
      ),
      scheduled_days AS (
        SELECT e.user_id, e.date FROM expected_shifts e
        LEFT JOIN leave_requests lr ON lr.user_id = e.user_id AND lr.type = 'dayoff' AND lr.status = 'Approved' AND e.date BETWEEN lr.start_date AND lr.end_date
        WHERE lr.id IS NULL
      ),
      actual_attendance AS (SELECT user_id, date, status FROM attendance WHERE date >= DATE_TRUNC('month', CURRENT_DATE))
      SELECT COALESCE(ROUND(COUNT(a.status) FILTER (WHERE a.status IN ('Present', 'Late')) * 100.0 / NULLIF(COUNT(s.date), 0)), 0) as average 
      FROM scheduled_days s LEFT JOIN actual_attendance a ON s.user_id = a.user_id AND s.date = a.date
    `;

    return {
      headcount: Number(headcountRes[0]?.count || 0),
      openPositions: Number(openPosRes[0]?.count || 0),
      pendingRequests: Number(pendingRes[0]?.total || 0),
      avgAttendance: Number(attendanceRes[0]?.average || 0),
    };
  } catch (error) {
    console.error("Failed to fetch card metrics:", error);
    return {
      headcount: 0,
      openPositions: 0,
      pendingRequests: 0,
      avgAttendance: 0,
    };
  }
}

export async function getChartData(actorId: string) {
  try {
    const rawData = await db`
      ${authUsersCTE(actorId)}
      SELECT TO_CHAR(p.month, 'Mon') AS month, EXTRACT(MONTH FROM p.month) AS month_num,
      ROUND(AVG(p.teamwork)) AS engagement, ROUND(AVG(p.attendance)) AS retention    
      FROM performance_history p JOIN users u ON p.user_id = u.id
      WHERE p.month >= DATE_TRUNC('year', CURRENT_DATE) AND u.id IN (SELECT id FROM auth_users)
      GROUP BY TO_CHAR(p.month, 'Mon'), EXTRACT(MONTH FROM p.month) ORDER BY month_num ASC
    `;
    return rawData.map((row) => ({
      month: row.month,
      engagement: Number(row.engagement) || 0,
      retention: Number(row.retention) || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return [];
  }
}

export async function getQuickOperationsData(actorId: string) {
  try {
    const isLeader = await verifyFeatureAccess(actorId, "update_records");
    let pendingRequests: DashboardPendingRequest[] = [];

    if (isLeader) {
      pendingRequests = await db<DashboardPendingRequest[]>`
        ${authUsersCTE(actorId, "update_records")}
        SELECT r.id, r.type, r.reason as description, r.status, r.created_at, u.name as employee_name, u.job_title, u.image_url as employee_image
        FROM leave_requests r JOIN users u ON r.user_id = u.id
        WHERE r.status ILIKE 'pending' AND u.id IN (SELECT id FROM auth_users)
        ORDER BY r.created_at ASC LIMIT 5
      `;
    }
    return { isLeader, pendingRequests };
  } catch (error) {
    console.error("Failed to fetch quick operations:", error);
    return { isLeader: false, pendingRequests: [] };
  }
}

export async function getSecondaryWidgetsData(actorId: string) {
  try {
    const outToday = await db<DashboardOutToday[]>`
      ${authUsersCTE(actorId)}
      SELECT u.name, 'On Leave' as status, lr.type as detail
      FROM leave_requests lr JOIN users u ON lr.user_id = u.id
      WHERE lr.status = 'Approved' AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date AND u.id IN (SELECT id FROM auth_users)
      UNION
      SELECT u.name, a.status, COALESCE(a.check_in, 'No check-in') as detail
      FROM attendance a JOIN users u ON a.user_id = u.id
      WHERE a.date = CURRENT_DATE AND a.status IN ('Late', 'Absent') AND u.id IN (SELECT id FROM auth_users)
    `;

    const complianceAlerts = await db<DashboardComplianceAlert[]>`
      ${authUsersCTE(actorId)}
      SELECT name, join_date + INTERVAL '90 days' as probation_end
      FROM users
      WHERE status = 'Active' AND join_date + INTERVAL '90 days' BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '14 days'
        AND id IN (SELECT id FROM auth_users)
    `;

    const payrollRun = await db<DashboardPayrollRun[]>`
      SELECT pay_period_start, pay_period_end, status, pay_date FROM pay_stubs ORDER BY pay_period_start DESC LIMIT 1
    `;

    const jobStats = await db`
      SELECT department, COUNT(*)::int as count FROM job_postings WHERE status = 'Open' GROUP BY department ORDER BY count DESC LIMIT 3
    `;

    return {
      outToday,
      complianceAlerts,
      payroll: payrollRun[0] || null,
      activeJobs: jobStats,
    };
  } catch (error) {
    console.error("Failed to fetch secondary widgets:", error);
    return {
      outToday: [],
      complianceAlerts: [],
      payroll: null,
      activeJobs: [],
    };
  }
}
