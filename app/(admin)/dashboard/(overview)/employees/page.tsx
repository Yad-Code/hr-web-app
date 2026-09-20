// @/app/(admin)/dashboard/(overview)/employees/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { verifyFeatureAccess } from "@/app/lib/auth/access-control";
import { EmployeeSearchListClient } from "./EmployeeSearchList";
import { EmployeeSearchListSkeleton } from "@/app/ui/employee/skeleton";
import { getDirectoryEmployees } from "@/app/lib/employeeList/data";

export const metadata = {
  title: "Team Presence | HR Suite",
};

export default async function EmployeesStatusPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { employees, hasAdminView } = await getDirectoryEmployees(
    session.user.id,
  );

  const canDelete = await verifyFeatureAccess(
    session.user.id,
    "delete_records",
  );
  const canManageAccess = await verifyFeatureAccess(
    session.user.id,
    "manage_system_access",
  );

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {hasAdminView ? "Company Directory" : "My Team's Presence"}
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl">
          {hasAdminView
            ? "Monitor real-time availability, schedule visibility, and active locations across the entire enterprise."
            : "Monitor real-time availability, schedule visibility, and active locations for your authorized scopes."}
        </p>
      </div>

      <Suspense fallback={<EmployeeSearchListSkeleton />}>
        <EmployeeSearchListClient
          initialEmployees={employees}
          canDelete={canDelete}
          canManageAccess={canManageAccess}
        />
      </Suspense>
    </main>
  );
}
