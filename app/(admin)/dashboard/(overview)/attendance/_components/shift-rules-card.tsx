import { ShieldAlert } from "lucide-react";
import { ShiftRule } from "../types";

export function ShiftRulesCard({ shifts }: { shifts: ShiftRule[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-600" />
          Active Shift Policies
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {shift.shiftName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {shift.startTime} - {shift.endTime} (Grace:{" "}
                {shift.gracePeriodMinutes}m)
              </p>
            </div>
            <span className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-md font-bold">
              Enforced
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
