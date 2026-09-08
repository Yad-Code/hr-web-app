// @/app/(admin)/dashboard/(overview)/payroll/page.tsx
import { fetchAllPayStubs } from "@/app/lib/admin/payroll/data";
import {
  generateMonthlyPayroll,
  rollbackProcessingPayroll,
} from "@/app/lib/admin/payroll/actions";

import { auth } from "@/auth";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

import { AdminPayrollTable } from "./AdminPayrollTable";

export default async function AdminPayrollPage() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-8 ring-slate-50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mb-8">
          You do not have the required permissions to view the payroll module.
          This area is restricted to HR Administrators.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </main>
    );
  }

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
            Company Payroll
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and process enterprise salaries and pay stubs.
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

          {totalProcessing > 0 && (
            <form
              action={async () => {
                "use server";
                await rollbackProcessingPayroll();
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-xs"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear Processing
              </button>
            </form>
          )}

          <form
            action={async () => {
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
