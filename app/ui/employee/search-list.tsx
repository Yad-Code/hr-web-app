//@/app/ui/employee/search-list.tsx

import { fetchEmployeeStatusList } from "@/app/lib/employeeDashboard/employee/data";
import { EmployeeSearchListClient } from "@/app/(admin)/dashboard/(overview)/employees/EmployeeSearchList";
import { auth } from "@/auth";

export async function EmployeeSearchList() { 
const employees = await fetchEmployeeStatusList();
   
  const session = await auth();
  const isAdmin = session?.user?.isAdmin || false; 

  return <EmployeeSearchListClient initialEmployees={employees} isAdmin={isAdmin} />;
}
