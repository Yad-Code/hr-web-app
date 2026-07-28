// app/ui/employee/performance/tabs/overview-tab.tsx
"use client";

import { KPI, PerformanceHistory, PerformanceNotification } from "@/app/lib/performance/definitions";
import { formatDate } from "@/app/lib/utils";

interface OverviewTabProps {
  kpis: KPI[];
  history: PerformanceHistory[];
  notifications: PerformanceNotification[];
}

export default function OverviewTab({ kpis, history, notifications }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.value}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500">Target: {kpi.target}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  kpi.is_up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Metrics Breakdown */}
        <section className="lg:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Monthly Performance Breakdown</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No history data logged.</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">{formatDate(record.month)}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Productivity</p>
                      <p className="text-base font-bold text-slate-900">{record.productivity}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Quality</p>
                      <p className="text-base font-bold text-slate-900">{record.quality}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Teamwork</p>
                      <p className="text-base font-bold text-slate-900">{record.teamwork}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Attendance</p>
                      <p className="text-base font-bold text-slate-900">{record.attendance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notifications Sidebar */}
        <section className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Updates & Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">{notif.type}</span>
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                  <p className="text-xs text-slate-500">{notif.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}