import { RetentionEngagementChart } from "./line-chart";
import { auth } from "@/auth";
import { getChartData } from "@/app/lib/admin/dashboard/data";

export default async function AdminChartWrapper() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const chartData = await getChartData(session.user.id);

  return (
    <div className="w-full">
      <RetentionEngagementChart data={chartData} />
    </div>
  );
}