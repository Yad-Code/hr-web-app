// app/ui/dashboard/cards-wrapper.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { Card } from "@/app/ui/dashboard/cards";
import { auth } from "@/auth";

export default async function AdminCardsWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.isAdmin;
  const managerName = session.user.name as string;

  let headcountResult,
    openPositionsResult,
    pendingRequestsResult,
    attendanceResult;

  // The CTE (Common Table Expression) builds a dynamic calendar to calculate exact expected working days
  const attendanceQuery = isAdmin
    ? db`
      WITH target_users AS (
        SELECT id, COALESCE(working_days, '{1,2,3,4,5}'::int[]) as working_days 
        FROM users WHERE status = 'Active'
      ),
      past_days AS (
        SELECT date::date FROM generate_series(DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE, '1 day'::interval) AS date
      ),
      expected_shifts AS (
        SELECT u.id as user_id, p.date
        FROM target_users u CROSS JOIN past_days p
        WHERE EXTRACT(DOW FROM p.date)::int = ANY(u.working_days)
      ),
      scheduled_days AS (
        SELECT e.user_id, e.date
        FROM expected_shifts e
        LEFT JOIN leave_requests lr ON lr.user_id = e.user_id AND lr.type = 'dayoff' AND lr.status = 'Approved' AND e.date BETWEEN lr.start_date AND lr.end_date
        WHERE lr.id IS NULL
      ),
      actual_attendance AS (
        SELECT user_id, date, status FROM attendance WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT COALESCE(ROUND(COUNT(a.status) FILTER (WHERE a.status IN ('Present', 'Late')) * 100.0 / NULLIF(COUNT(s.date), 0)), 0) as average 
      FROM scheduled_days s
      LEFT JOIN actual_attendance a ON s.user_id = a.user_id AND s.date = a.date;
    `
    : db`
      WITH target_users AS (
        SELECT id, COALESCE(working_days, '{1,2,3,4,5}'::int[]) as working_days 
        FROM users WHERE status = 'Active' AND manager_name = ${managerName}
      ),
      past_days AS (
        SELECT date::date FROM generate_series(DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE, '1 day'::interval) AS date
      ),
      expected_shifts AS (
        SELECT u.id as user_id, p.date
        FROM target_users u CROSS JOIN past_days p
        WHERE EXTRACT(DOW FROM p.date)::int = ANY(u.working_days)
      ),
      scheduled_days AS (
        SELECT e.user_id, e.date
        FROM expected_shifts e
        LEFT JOIN leave_requests lr ON lr.user_id = e.user_id AND lr.type = 'dayoff' AND lr.status = 'Approved' AND e.date BETWEEN lr.start_date AND lr.end_date
        WHERE lr.id IS NULL
      ),
      actual_attendance AS (
        SELECT user_id, date, status FROM attendance WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT COALESCE(ROUND(COUNT(a.status) FILTER (WHERE a.status IN ('Present', 'Late')) * 100.0 / NULLIF(COUNT(s.date), 0)), 0) as average 
      FROM scheduled_days s
      LEFT JOIN actual_attendance a ON s.user_id = a.user_id AND s.date = a.date;
    `;

  if (isAdmin) {
    [
      headcountResult,
      openPositionsResult,
      pendingRequestsResult,
      attendanceResult,
    ] = await Promise.all([
      db`SELECT COUNT(*) FROM users WHERE status = 'Active'`,
      db`SELECT COUNT(*) FROM job_postings WHERE status = 'Open'`,
      db`SELECT COUNT(*) as total FROM leave_requests WHERE status ILIKE 'pending'`,
      attendanceQuery,
    ]);
  } else {
    [
      headcountResult,
      openPositionsResult,
      pendingRequestsResult,
      attendanceResult,
    ] = await Promise.all([
      db`SELECT COUNT(*) FROM users WHERE status = 'Active' AND manager_name = ${managerName}`,
      db`SELECT COUNT(*) FROM job_postings WHERE status = 'Open'`,
      db`SELECT COUNT(*) as total FROM leave_requests lr JOIN users u ON lr.user_id = u.id WHERE lr.status ILIKE 'pending' AND u.manager_name = ${managerName}`,
      attendanceQuery,
    ]);
  }

  const headcount = headcountResult[0].count;
  const openPositions = openPositionsResult[0].count;
  const pendingRequests = pendingRequestsResult[0].total;
  const avgAttendance = Number(attendanceResult[0].average) || 0;

  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="Total HeadCount"
        value={headcount}
        type="users"
        trend={
          <span className="text-emerald-600 font-semibold text-xs">
            {headcount > 0 ? `+${headcount} Employees` : "No Employees Found"}
          </span>
        }
      />
      <Card
        title="Open Positions"
        value={openPositions}
        type="positions"
        trend={
          <span className="text-slate-500 font-semibold text-xs">
            {openPositions > 0
              ? `${openPositions} Open Positions`
              : "No Open Positions"}
          </span>
        }
      />
      <Card
        title="Pending Requests"
        value={pendingRequests}
        type="pending"
        trend={
          <span className="text-amber-600 font-semibold text-xs">
            {pendingRequests > 0
              ? `+${pendingRequests} Pending`
              : "No Pending Requests"}
          </span>
        }
      />
      <Card
        title="Avg. Attendance Rate"
        value={`${avgAttendance}%`}
        type="attendance"
        trend={
          <span className="text-emerald-600 font-semibold text-xs">
            Current Month
          </span>
        }
      />
    </div>
  );
}
