// app/ui/dashboard/chart-wrapper.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { RetentionEngagementChart } from "./line-chart"; 

export default async function AdminChartWrapper() { 
  const rawData = await db`
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
