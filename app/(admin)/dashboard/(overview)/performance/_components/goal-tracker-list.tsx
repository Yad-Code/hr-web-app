// @/app/(admin)/dashboard/(overview)/performance/_components/goal-tracker-list.tsx
import { Target, Calendar, Flag, ArrowRight } from "lucide-react";
import { GoalRow } from "../types";
import Link from "next/link";

export function GoalTrackerList({ goals }: { goals: GoalRow[] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-rose-600 bg-rose-50 border-rose-100";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "low":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default:
        return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Key Objective & Goal Tracker
        </h2>
        <Link
          href="/dashboard/performance/goals"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-4 space-y-5">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-start justify-between text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 block">
                    {goal.title}
                    <span className="text-[10px] text-slate-400 font-normal ml-2">
                      ({goal.employee_name})
                    </span>
                  </span>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span
                      className={`px-1.5 py-0.5 rounded flex items-center gap-1 border ${getPriorityColor(goal.priority)}`}
                    >
                      <Flag className="w-3 h-3" />
                      {goal.priority || "Standard"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(goal.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-slate-600 block">
                    {goal.progress}%
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {goal.status.toLowerCase()}
                  </span>
                </div>
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
