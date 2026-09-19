// app/(employee)/my-profile/performance/page.tsx
import { getPerformanceDashboard } from "@/app/lib/employeeDashboard/performance/data";
import PerformanceDashboard from "@/app/ui/employee/performance/performance-dashboard";
import { redirect } from "next/navigation";

export default async function PerformancePage() {
  const dashboardData = await getPerformanceDashboard();

  if (!dashboardData) {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Performance Dashboard</h1>
      <PerformanceDashboard initialData={dashboardData} />
    </div>
  );
}
