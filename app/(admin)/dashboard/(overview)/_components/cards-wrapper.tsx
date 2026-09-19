import { Card } from "./cards";
import { auth } from "@/auth";
import { getCardsData } from "@/app/lib/admin/dashboard/data";

export default async function AdminCardsWrapper() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getCardsData(session.user.id);

  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="Total HeadCount"
        value={data.headcount}
        type="users"
        trend={
          <span className="text-emerald-600 font-semibold text-xs">
            {data.headcount > 0
              ? `+${data.headcount} Employees`
              : "No Employees Found"}
          </span>
        }
      />
      <Card
        title="Open Positions"
        value={data.openPositions}
        type="positions"
        trend={
          <span className="text-slate-500 font-semibold text-xs">
            {data.openPositions > 0
              ? `${data.openPositions} Open Positions`
              : "No Open Positions"}
          </span>
        }
      />
      <Card
        title="Pending Requests"
        value={data.pendingRequests}
        type="pending"
        trend={
          <span className="text-amber-600 font-semibold text-xs">
            {data.pendingRequests > 0
              ? `+${data.pendingRequests} Pending`
              : "No Pending Requests"}
          </span>
        }
      />
      <Card
        title="Avg. Attendance Rate"
        value={`${data.avgAttendance}%`}
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
