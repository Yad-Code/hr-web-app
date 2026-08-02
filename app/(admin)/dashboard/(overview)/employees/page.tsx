// @/app/(admin)/dashboard/(overview)/employees/page.tsx
import { Suspense } from "react";
import { EmployeeSearchList } from "@/app/ui/employee/search-list";
import { EmployeeSearchListSkeleton } from "@/app/ui/employee/skeleton";

export const metadata = {
  title: "Team Presence | HR Suite",
};

export default async function EmployeesStatusPage() {
  return (
    <main className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
      {/* Static header renders immediately before async content streams in */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Employee Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time status, location, and schedule visibility across the team.
        </p>
      </div>

      <Suspense fallback={<EmployeeSearchListSkeleton />}>
        <EmployeeSearchList />
      </Suspense>
    </main>
  );
}
