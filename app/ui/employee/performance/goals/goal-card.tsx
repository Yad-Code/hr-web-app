// app/ui/employee/performance/components/goal-card.tsx
"use client";

import { DisplayGoal } from "../tabs/goals-tab";
import { formatDate } from "@/app/lib/utils";

interface GoalCardProps {
  goal: DisplayGoal;
  onSliderChange: (goalId: string, newProgress: number) => void;
}

export default function GoalCard({ goal, onSliderChange }: GoalCardProps) {
  return (
    <div
      className={`p-5 bg-white border rounded-xl shadow-sm transition-all ${
        goal.isModified || goal.isNew
          ? "border-blue-400 ring-1 ring-blue-400/20"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900">{goal.title}</h4>
            {(goal.isModified || goal.isNew) && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {goal.isNew ? "New Unsaved" : "Unsaved"}
              </span>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-slate-600 mt-1">{goal.description}</p>
          )}
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            goal.priority === "High"
              ? "bg-red-100 text-red-700"
              : goal.priority === "Medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {goal.priority} Priority
        </span>
      </div>

      {/* Slider */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          disabled={goal.isNew}
          value={goal.progress}
          onChange={(e) => onSliderChange(goal.id, Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
        <span>Due: {formatDate(goal.due_date).split("T")[0]}</span>
        <span>Status: {goal.status}</span>
      </div>
    </div>
  );
}