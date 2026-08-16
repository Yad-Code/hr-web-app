// app/ui/employee/performance/tabs/overview-tab.tsx
"use client";

import {
  KPI,
  PerformanceHistory,
  PerformanceNotification,
} from "@/app/lib/employeeDashboard/performance/definitions";
import PerformanceChart from "./performance-chart";

interface OverviewTabProps {
  kpis: KPI[];
  history: PerformanceHistory[];
  notifications: PerformanceNotification[];
  onNavigateTab?: (tabName: string) => void;
}

export default function OverviewTab({
  kpis,
  history,
  notifications,
  onNavigateTab,
}: OverviewTabProps) {
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <div className="space-y-8 max-w-5xl">
      {unreadNotifications.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600 text-white rounded-lg text-xs font-bold">
              {unreadNotifications.length}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">Action Needed</p>
              <p className="text-xs text-slate-600">
                {unreadNotifications[0].title}:{" "}
                {unreadNotifications[0].description}
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("feedback")}
              className="text-xs font-semibold bg-white border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              View Feedback →
            </button>
          )}
        </div>
      )}

      {/* 2. Key Performance Indicators Grid */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Key Performance Indicators
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Current Review Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2"
            >
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {kpi.label}
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {kpi.value}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    kpi.is_up
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {kpi.trend}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target:{" "}
                <span className="font-semibold text-slate-600">
                  {kpi.target}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Monthly Visual Breakdown */}
        <section className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              Monthly Performance Trends
            </h2>
            <span className="text-xs text-slate-400">
              Last {history.length} Months
            </span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No monthly metrics logged yet.
            </p>
          ) : (
            <PerformanceChart history={history} />
          )}
        </section>

        {/* 4. Quick Actions Sidebar */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Quick Actions
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab("self-assessment")}
              className="w-full p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Self Assessment
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Edit draft or view current review cycle
              </p>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab("career")}
              className="w-full p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Schedule 1:1 Sync
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Book a performance alignment meeting
              </p>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab("goals")}
              className="w-full p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Review Active Goals
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Track sprint & OKR goal progress
              </p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
