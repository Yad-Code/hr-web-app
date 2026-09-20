// @/app/ui/employee/search-list.tsx
import { getDirectoryEmployees } from "@/app/lib/employeeList/data";
import { EmployeeSearchListClient } from "@/app/(admin)/dashboard/(overview)/employees/EmployeeSearchList";
import { auth } from "@/auth";
import { verifyFeatureAccess } from "@/app/lib/auth/access-control";

export async function EmployeeSearchList() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { employees } = await getDirectoryEmployees(session.user.id);

  const canDelete = await verifyFeatureAccess(
    session.user.id,
    "delete_records",
  );
  const canManageAccess = await verifyFeatureAccess(
    session.user.id,
    "manage_system_access",
  );

  return (
    <EmployeeSearchListClient
      initialEmployees={employees}
      canDelete={canDelete}
      canManageAccess={canManageAccess}
    />
  );
}
