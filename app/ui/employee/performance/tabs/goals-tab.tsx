// app/ui/employee/performance/tabs/goals-tab.tsx
"use client";

import { useState, useTransition } from "react";
import { Goal } from "@/app/lib/performance/definitions";
import { updateGoalProgress } from "@/app/lib/performance/actions/goals"; // Server Action

interface GoalsTabProps {
  goals: Goal[];
}

export default function GoalsTab({ goals }: GoalsTabProps) {
  // Map of goal ID -> modified progress percentage { [goalId]: number }
  const [pendingProgress, setPendingProgress] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasUnsavedChanges = Object.keys(pendingProgress).length > 0;

  // Track progress adjustments locally without touching the server yet
  const handleSliderChange = (goalId: string, newProgress: number) => {
    const originalGoal = goals.find((g) => g.id === goalId);

    // If slider is moved back to original database value, remove from pending map
    if (originalGoal && originalGoal.progress === newProgress) {
      setPendingProgress((prev) => {
        const next = { ...prev };
        delete next[goalId];
        return next;
      });
    } else {
      setPendingProgress((prev) => ({
        ...prev,
        [goalId]: newProgress,
      }));
    }
  };

  // Dispatch batch updates to server on Save click
  const handleSaveChanges = () => {
    setFeedbackMessage(null);

    startTransition(async () => {
      try {
        const updates = Object.entries(pendingProgress).map(([goalId, progress]) =>
          updateGoalProgress(goalId, progress) // Triggers server action for each modified goal
        );

        await Promise.all(updates);

        setPendingProgress({}); // Reset pending changes
        setFeedbackMessage({ type: "success", text: "Goal progress saved successfully!" });
      } catch (err) {
        console.error("Failed to save updates:", err);
        setFeedbackMessage({ type: "error", text: "Failed to save goal updates. Please try again." });
      }
    });
  };

  const handleDiscard = () => {
    setPendingProgress({});
    setFeedbackMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800">Goal Progress</h3>
          <p className="text-xs text-slate-500">
            {hasUnsavedChanges
              ? `You have ${Object.keys(pendingProgress).length} unsaved goal change(s).`
              : "Adjust goal sliders below and click Save Changes when ready."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isPending}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold ${
            feedbackMessage.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const currentProgress = pendingProgress[goal.id] ?? goal.progress;
          const isModified = goal.id in pendingProgress;

          return (
            <div
              key={goal.id}
              className={`p-5 bg-white border rounded-xl shadow-sm transition-all ${
                isModified ? "border-blue-400 ring-1 ring-blue-400/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{goal.title}</h4>
                    {isModified && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Unsaved
                      </span>
                    )}
                  </div>
                  {goal.description && <p className="text-xs text-slate-600 mt-1">{goal.description}</p>}
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

              {/* Deferred Progress Slider */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Progress</span>
                  <span>{currentProgress}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentProgress}
                  onChange={(e) => handleSliderChange(goal.id, Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
                <span>Due: {String(goal.due_date).split("T")[0]}</span>
                <span>Status: {goal.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}