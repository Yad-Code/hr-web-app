// app/ui/dashboard/chart-wrapper.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { RetentionEngagementChart } from "./line-chart";
import { auth } from "@/auth";

export default async function AdminChartWrapper() {
  const session = await auth();
 
  if (!session?.user) return null;

  const isAdmin = session.user.role === "admin";
 
  const managerName = session.user.name as string;

  let rawData;

  if (isAdmin) {
    rawData = await db`
      SELECT 
        TO_CHAR(month, 'Mon') AS month,
        EXTRACT(MONTH FROM month) AS month_num,
        ROUND(AVG(teamwork)) AS engagement,   
        ROUND(AVG(attendance)) AS retention    
      FROM performance_history
      WHERE month >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY TO_CHAR(month, 'Mon'), EXTRACT(MONTH FROM month)
      ORDER BY month_num ASC
    `;
  } else {
    rawData = await db`
      SELECT 
        TO_CHAR(p.month, 'Mon') AS month,
        EXTRACT(MONTH FROM p.month) AS month_num,
        ROUND(AVG(p.teamwork)) AS engagement,   
        ROUND(AVG(p.attendance)) AS retention    
      FROM performance_history p
      JOIN users u ON p.user_id = u.id
      WHERE p.month >= DATE_TRUNC('year', CURRENT_DATE)
        AND u.manager_name = ${managerName}
      GROUP BY TO_CHAR(p.month, 'Mon'), EXTRACT(MONTH FROM p.month)
      ORDER BY month_num ASC
    `;
  }

  const chartData = rawData.map((row) => ({
    month: row.month,
    engagement: Number(row.engagement) || 0,
    retention: Number(row.retention) || 0,
  }));

  return (
    <div className="w-full">
      <RetentionEngagementChart data={chartData} />
    </div>
  );
}
