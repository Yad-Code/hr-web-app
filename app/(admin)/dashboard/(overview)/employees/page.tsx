import { Suspense } from "react";
import { EmployeeSearchList } from "../../../../ui/employee/search-list";
import { EmployeeSearchListSkeleton } from "../../../../ui/employee/skeleton"; // 👈 Import the skeleton component

export const metadata = {
  title: "Team Presence | HR Suite",
};

export default async function EmployeesStatusPage() {
  return (
    <main className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
      {/* 
        Next.js will automatically stream the skeleton instantly while 
        fetchEmployeeStatusList() resolves server-side! 
      */}
      <Suspense fallback={<EmployeeSearchListSkeleton />}>
        <EmployeeSearchList />
      </Suspense>
    </main>
  );
}