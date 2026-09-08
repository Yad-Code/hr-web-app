// app/my-profile/performance/page.tsx
import { getCurrentUserId } from "@/app/lib/employeeDashboard/performance/actions/utils";
import { getPerformanceDashboard } from "@/app/lib/employeeDashboard/performance/data";
import PerformanceDashboard from "@/app/ui/employee/performance/performance-dashboard";

export default async function PerformancePage() { 
  const userId = await getCurrentUserId();
 
  const dashboardData = await getPerformanceDashboard(userId);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Performance Dashboard</h1> 
      <PerformanceDashboard initialData={dashboardData} />
    </div>
  );
} 