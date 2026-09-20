// @/app/ui/employee/search-list.tsx
import { fetchEmployeeStatusList } from "@/app/lib/employeeDashboard/employee/data";
import { EmployeeSearchListClient } from "@/app/(admin)/dashboard/(overview)/employees/EmployeeSearchList";
import { auth } from "@/auth";
 
export async function EmployeeSearchList() { 
  const employees = await fetchEmployeeStatusList();
   
  const session = await auth();
   
  const role = session?.user?.role?.toLowerCase() || "employee";
  const isAdmin = role === "admin" || role === "hr";

  return <EmployeeSearchListClient initialEmployees={employees} isAdmin={isAdmin} />;
}