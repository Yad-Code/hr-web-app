// @/app/(admin)/dashboard/(overview)/attendance/_components/attendance-kpi-cards.tsx

import { UserCheck, Clock, UserX, CalendarOff } from "lucide-react";
import { AttendanceKpiData } from "../types";

export function AttendanceKpiCards({ stats }: { stats: AttendanceKpiData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Present Today */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-[#009473] dark:text-emerald-400 rounded-xl">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Present Today
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.presentToday}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              / {stats.totalEmployees}
            </span>
          </div>
        </div>
      </div>

      {/* Late Arrivals */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Late Arrivals
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.lateToday}
            </span>
          </div>
        </div>
      </div>

      {/* Absent */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Absent
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.absentToday}
            </span>
          </div>
        </div>
      </div>

      {/* On Leave */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
          <CalendarOff className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            On Leave / PTO
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.onLeaveToday}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}