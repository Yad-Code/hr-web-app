// app/my-profile/performance/page.tsx
import { getCurrentUserId } from "@/app/lib/performance/actions/utils";
import { getPerformanceDashboard } from "@/app/lib/performance/data";
import PerformanceDashboard from "@/app/ui/employee/performance/performance-dashboard";

export default async function PerformancePage() {
  // 1. Get the current authenticated user[cite: 10]
  const userId = await getCurrentUserId();

  // 2. Fetch all performance data in parallel[cite: 1]
  const dashboardData = await getPerformanceDashboard(userId);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Performance Dashboard</h1>
      {/* 3. Pass the fetched data to the Client Component */}
      <PerformanceDashboard initialData={dashboardData} />
    </div>
  );
}