import { fetchEmployeeStatusList } from "@/app/lib/data";
import { EmployeeSearchListClient } from "@/app/(admin)/employees/EmployeeSearchList";

export async function EmployeeSearchList() {
  // Fetch data securely straight from the database on the server
  const employees = await fetchEmployeeStatusList();

  // Pass it as initial hydration parameters down to your stateful tracker
  return <EmployeeSearchListClient initialEmployees={employees} />;
}
