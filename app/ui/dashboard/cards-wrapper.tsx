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
    db`SELECT COUNT(*) FROM users`,
    db`SELECT COUNT(*) FROM job_postings WHERE status = 'Open'`,
    db`SELECT 
        (SELECT COUNT(*) FROM requests WHERE LOWER(status) = 'pending') + 
        (SELECT COUNT(*) FROM wfh_requests WHERE LOWER(status) = 'pending') 
       AS total`,
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
            +4.5% This month
          </span>
        }
      />
      <Card
        title="Open Positions"
        value={openPositions}
        type="positions"
        trend={
          <span className="text-slate-500 font-semibold text-xs">
            Updated just now
          </span>
        }
      />
      <Card
        title="Pending Requests"
        value={pendingRequests}
        type="pending"
        trend={
          <span className="text-amber-600 font-semibold text-xs">
            Needs attention
          </span>
        }
      />
      <Card
        title="Avg. Attendance Rate"
        value={`${avgAttendance}%`}
        type="attendance"
        trend={
          <span className="text-emerald-600 font-semibold text-xs">
            +3% This Season
          </span>
        }
      />
    </div>
  );
}