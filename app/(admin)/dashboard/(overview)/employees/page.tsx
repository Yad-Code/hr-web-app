// @/app/(admin)/dashboard/(overview)/employees/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { EmployeeSearchList } from "@/app/ui/employee/search-list";
import { EmployeeSearchListSkeleton } from "@/app/ui/employee/skeleton";

export const metadata = {
  title: "Team Presence | HR Suite",
};

export default async function EmployeesStatusPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Softened Header Layout */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {isAdmin ? "Company Directory" : "My Team's Presence"}
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl">
          {isAdmin
            ? "Monitor real-time availability, schedule visibility, and active locations across the entire enterprise."
            : "Monitor real-time availability, schedule visibility, and active locations for your direct reports."}
        </p>
      </div>

      <Suspense fallback={<EmployeeSearchListSkeleton />}>
        <EmployeeSearchList />
      </Suspense>
    </main>
  );
}
