// app/ui/employee/payroll/tabs/overview-tab.tsx
"use client";

import { CompensationSummary, PayStub } from "@/app/lib/employeeDashboard/payroll/definitions";

interface OverviewTabProps {
  summary: CompensationSummary;
  latestStub?: PayStub;
  onNavigateTab: (tab: string) => void;
}

export default function OverviewTab({
  summary,
  latestStub,
  onNavigateTab,
}: OverviewTabProps) {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: summary.currency || "USD",
    }).format(Math.abs(amount));

  // Filter to keep ONLY earnings
  const incomeItems =
    latestStub?.items.filter((item) => item.type === "earning") ?? [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Yearly Take-Home Pay
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(summary.annual_net)}
          </p>
          <p className="text-xs text-slate-400">
            Your agreed total annual payout
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Monthly Base
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(summary.monthly_base)}
          </p>
          <p className="text-xs text-slate-400">
            Paid {summary.pay_frequency.toLowerCase()}
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Money Received
          </p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {formatMoney(summary.ytd_net)}
          </p>
          <p className="text-xs text-slate-400">
            Deposited into your bank this year
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Payment Overview */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Latest Payment
              </h2>
              <p className="text-xs text-slate-500">
                Paid on: {latestStub?.pay_date}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("payslips")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              See All Payslips →
            </button>
          </div>

          {latestStub ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-5 rounded-xl text-center border border-emerald-100">
                <p className="text-xs text-slate-600 font-medium">
                  Total Payment Received
                </p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {formatMoney(latestStub.net_pay)}
                </p>
              </div>

              {/* Income Items Breakdown */}
              {incomeItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-700">
                    Earnings Breakdown
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                    {incomeItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.category}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-slate-400">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No payment records found.
            </p>
          )}
        </section>

        {/* Shortcuts Panel */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Shortcuts
          </h2>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab("payslips")}
              className="w-full p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group cursor-pointer"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                View All Payslips
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Check and download previous payment statements
              </p>
            </button>

            <button
              onClick={() => onNavigateTab("payment-methods")}
              className="w-full p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group cursor-pointer"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Bank Account Details
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage where your money gets sent
              </p>
            </button>

            <button
              onClick={() => onNavigateTab("company-docs")}
              className="w-full p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group cursor-pointer"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Company Documents
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                View official forms and statements
              </p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
