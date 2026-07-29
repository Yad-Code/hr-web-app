// app/ui/employee/payroll/tabs/payslips-tab.tsx
"use client";

import { useState } from "react";
import { PayStub } from "@/app/lib/payroll/definitions";

export default function PayslipsTab({ payStubs }: { payStubs: PayStub[] }) {
  const [selectedStub, setSelectedStub] = useState<PayStub | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(val));

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Pay Statements History
          </h2>
          <span className="text-xs text-slate-500">
            {payStubs.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="p-4">Pay Period</th>
                <th className="p-4">Pay Date</th>
                <th className="p-4">Take-Home Pay</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {payStubs.map((stub) => (
                <tr
                  key={stub.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 font-semibold text-slate-900">
                    {stub.pay_period_start} – {stub.pay_period_end}
                  </td>
                  <td className="p-4">{stub.pay_date}</td>
                  <td className="p-4 font-bold text-emerald-600">
                    {formatCurrency(stub.net_pay)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        stub.status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : stub.status === "processing"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {stub.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedStub(stub)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      View Breakdown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Detail Slide-Over / Modal */}
      {selectedStub && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 p-4 sm:p-6">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Payment Statement
                </h3>
                <p className="text-xs text-slate-500">
                  Paid on {selectedStub.pay_date}
                </p>
              </div>
              <button
                onClick={() => setSelectedStub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Take-Home Summary Box */}
              <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-xl text-center">
                <p className="text-slate-600 font-medium text-xs">
                  Total Take-Home Pay
                </p>
                <p className="font-extrabold text-emerald-600 text-2xl mt-1">
                  {formatCurrency(selectedStub.net_pay)}
                </p>
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Earnings Breakdown
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {selectedStub.items
                    .filter((item) => item.type === "earning")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 flex justify-between items-center"
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
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedStub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}