// @/app/(admin)/dashboard/(overview)/performance/goals/page.tsx

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import Link from "next/link";
import { ArrowLeft, Target, Calendar, Plus } from "lucide-react";

// 1. Define the TypeScript interface for our query
interface FullGoalRow {
  id: string;
  title: string;
  progress: number;
  priority: string;
  due_date: string | Date;
  status: string;
  employee_name: string;
  department: string;
}

export default async function FullGoalsPage() {
  // 2. Fetch all goals (no LIMIT)
  const allGoals = (await db`
    SELECT 
      ug.id, 
      ug.title, 
      ug.progress, 
      ug.priority, 
      ug.due_date, 
      ug.status, 
      u.name as employee_name,
      u.department
    FROM user_goals ug
    JOIN users u ON ug.user_id = u.id
    ORDER BY 
      CASE WHEN ug.status = 'In Progress' THEN 1
           WHEN ug.status = 'Pending' THEN 2
           ELSE 3 END,
      ug.due_date ASC
  `) as unknown as FullGoalRow[];

  // Helper to color-code the priority badge
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/performance"
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Company Objectives & Goals
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track and manage all active employee targets.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/performance/goals/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Assign New Goal
        </Link>
      </div>

      {/* Grid Layout for Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allGoals.length > 0 ? (
          allGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getPriorityColor(goal.priority)}`}
                  >
                    {goal.priority || "Standard"} Priority
                  </span>
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border capitalize ${
                      goal.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {goal.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {goal.employee_name}{" "}
                    <span className="text-slate-300 mx-1">•</span>{" "}
                    {goal.department}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due:{" "}
                  {new Date(goal.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Progress</span>
                  <span className="font-bold text-slate-900">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.progress === 100 ? "bg-emerald-500" : "bg-[#009473]"}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-500 font-medium">
              No goals have been assigned yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
