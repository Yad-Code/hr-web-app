// @/app/(admin)/dashboard/(overview)/payroll/page.tsx
import { fetchAllPayStubs } from "@/app/lib/admin/payroll/data";
import { AdminPayrollTable } from "./AdminPayrollTable";
import { generateMonthlyPayroll } from "@/app/lib/admin/payroll/actions";

export default async function AdminPayrollPage() {
  const payStubs = await fetchAllPayStubs();

  const totalProcessing = payStubs.filter(
    (p) => p.status === "processing",
  ).length;
  const totalNetPayout = payStubs
    .filter((p) => p.status === "processing")
    .reduce((sum, record) => sum + Number(record.net_pay), 0);

  return (
    <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Payroll Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and process employee salaries and pay stubs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block mr-4 border-r border-slate-200 pr-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Pending Payout
            </p>
            <p className="text-lg font-bold text-slate-900">
              $
              {totalNetPayout.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Server Action Form */}
          <form
            action={async (formData: FormData) => {
              "use server";
              await generateMonthlyPayroll();
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Generate Payroll
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <AdminPayrollTable initialData={payStubs} />
      </div>
    </main>
  );
}
