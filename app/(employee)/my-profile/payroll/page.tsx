// @/app/(employee)/my-profile/payroll/page.tsx
import { getEmployeePayrollData } from "@/app/lib/employee/payroll/data";
import PayrollDashboard from "@/app/ui/employee/payroll/payroll-dashboard";
import { redirect } from "next/navigation";

export default async function Page() { 
  const data = await getEmployeePayrollData();

  if (!data) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8"> 
      <PayrollDashboard initialData={data} />
    </main>
  );
}
