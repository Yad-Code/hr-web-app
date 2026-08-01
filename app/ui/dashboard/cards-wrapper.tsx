// app/ui/dashboard/cards-wrapper.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { Card } from "@/app/ui/dashboard/cards";

export default async function AdminCardsWrapper() {
  // Fetch all metrics from the database in parallel
  const [
    headcountResult,
    openPositionsResult,
    pendingRequestsResult,
    attendanceResult,
  ] = await Promise.all([
    // Optional: Add `WHERE role = 'employee'` if you don't want admins in headcount
    db`SELECT COUNT(*) FROM users`,
    db`SELECT COUNT(*) FROM job_postings WHERE status = 'Open'`,

    // Updated: Replaces the old two-table subquery with the new leave_requests table
    db`SELECT COUNT(*) as total FROM leave_requests WHERE status ILIKE 'pending'`,

    db`SELECT AVG(attendance) as average FROM performance_history`,
  ]);

  // Extract the numerical values from the Postgres returns
  const headcount = headcountResult[0].count;
  const openPositions = openPositionsResult[0].count;
  const pendingRequests = pendingRequestsResult[0].total;

  // Round the average attendance to a clean whole number percentage
  const avgAttendance = Math.round(Number(attendanceResult[0].average)) || 0;

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
            {avgAttendance > 0
              ? `+${avgAttendance}% This month`
              : "No Attendance Data"}
          </span>
        }
      />
    </div>
  );
}
