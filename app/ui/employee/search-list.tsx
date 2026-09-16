//@/app/ui/employee/search-list.tsx

import { fetchEmployeeStatusList } from "@/app/lib/employeeDashboard/employee/data";
import { EmployeeSearchListClient } from "@/app/(admin)/dashboard/(overview)/employees/EmployeeSearchList";

export async function EmployeeSearchList() { 
  const employees = await fetchEmployeeStatusList();
 
  return <EmployeeSearchListClient initialEmployees={employees} />;
}
