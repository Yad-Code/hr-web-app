import { Target } from "lucide-react";
import { GoalRow } from "../types";

export function GoalTrackerList({ goals }: { goals: GoalRow[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Key Objective & Goal Tracker
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {goal.title}
                  <span className="text-[10px] text-slate-400 font-normal ml-2">
                    ({goal.employee_name})
                  </span>
                </span>
                <span className="font-semibold text-slate-600">
                  {goal.progress}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#009473] rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-4">
            No active goals currently in progress.
          </p>
        )}
      </div>
    </div>
  );
}