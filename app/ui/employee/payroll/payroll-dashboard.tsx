// app/ui/employee/payroll/payroll-dashboard.tsx
"use client";

import { useState } from "react";
import {
  CompensationSummary,
  PayStub,
  PaymentMethod,
  Document,
} from "@/app/lib/employeeDashboard/payroll/definitions";

import OverviewTab from "./tabs/overview-tab";
import PayslipsTab from "./tabs/payslips-tab";
import PaymentMethodsTab from "./tabs/payment-methods-tab";
import CompanyDocsTab from "./tabs/company-docs-tab";

export interface PayrollDashboardData {
  summary: CompensationSummary;
  payStubs: PayStub[];
  paymentMethods: PaymentMethod[];
  documents: Document[];
}

export default function PayrollDashboard({
  initialData,
}: {
  initialData: PayrollDashboardData;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview & Salary" },
    { id: "payslips", label: "Payslips & History" },
    { id: "payment-methods", label: "Payment Methods" },
    { id: "company-docs", label: "Company Documents" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Payroll & Compensation
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Earnings Hub</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track net payouts, review earnings history, and manage deposit
            accounts.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-right">
          <p className="text-xs text-slate-300">Next Scheduled Payday</p>
          <p className="text-base font-bold text-emerald-400 mt-0.5">
            {initialData.summary.next_pay_date}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap cursor-pointer rounded-t-lg ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            summary={initialData.summary}
            latestStub={initialData.payStubs[0]}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === "payslips" && (
          <PayslipsTab payStubs={initialData.payStubs} />
        )}
        {activeTab === "payment-methods" && (
          <PaymentMethodsTab methods={initialData.paymentMethods} />
        )}
        {activeTab === "company-docs" && (
          <CompanyDocsTab documents={initialData.documents} />
        )}
      </div>
    </div>
  );
}
