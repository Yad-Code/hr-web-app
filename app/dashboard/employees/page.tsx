import { fetchEmployeeStatusList } from "@/app/lib/data";
import { EmployeeSearchList } from "./EmployeeSearchList";

export const metadata = {
  title: "Team Presence | HR Suite",
};

export default async function EmployeesStatusPage() {
  const employees = await fetchEmployeeStatusList();

  return (
    <main className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <EmployeeSearchList initialEmployees={employees} />
    </main>
  );
}