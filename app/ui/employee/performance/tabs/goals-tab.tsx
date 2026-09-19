// app/ui/employee/performance/tabs/goals-tab.tsx
"use client";

import { useState, useTransition, useOptimistic } from "react";
import {
  Goal,
  NewGoalData,
} from "@/app/lib/employeeDashboard/performance/definitions";
import {
  updateGoalProgress,
  addGoal,
} from "@/app/lib/employeeDashboard/performance/actions";
import AddGoalModal from "@/app/ui/employee/performance/modals/add-goal-modal";
import GoalsHeader from "@/app/ui/employee/performance/goals/goals-header";
import GoalCard from "@/app/ui/employee/performance/goals/goal-card";

export interface DisplayGoal extends Goal {
  isModified: boolean;
  isNew: boolean;
}

export default function GoalsTab({ goals }: { goals: Goal[] }) {
  const [isPending, startTransition] = useTransition();

  const [optimisticGoals, setOptimisticGoals] = useOptimistic(
    goals,
    (
      currentGoals,
      action: {
        type: "SAVE_ALL";
        pendingProgress: Record<string, number>;
        pendingNewGoals: NewGoalData[];
      },
    ) => {
      const updatedExisting = currentGoals.map((g) => ({
        ...g,
        progress: action.pendingProgress[g.id] ?? g.progress,
      }));

      const createdGoals: Goal[] = action.pendingNewGoals.map((g, idx) => ({
        id: `opt-goal-${Date.now()}-${idx}`,
        user_id: "temp",
        title: g.title,
        description: g.description || "",
        priority: g.priority,
        due_date: new Date(g.due_date),
        progress: 0,
        status: "In Progress" as const,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      return [...updatedExisting, ...createdGoals];
    },
  );

  const [pendingProgress, setPendingProgress] = useState<
    Record<string, number>
  >({});
  const [pendingNewGoals, setPendingNewGoals] = useState<NewGoalData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const unsavedCount =
    Object.keys(pendingProgress).length + pendingNewGoals.length;
  const hasUnsavedChanges = unsavedCount > 0;

  const handleSliderChange = (goalId: string, newProgress: number) => {
    const originalGoal = optimisticGoals.find((g) => g.id === goalId);
    if (originalGoal && originalGoal.progress === newProgress) {
      setPendingProgress((prev) => {
        const next = { ...prev };
        delete next[goalId];
        return next;
      });
    } else {
      setPendingProgress((prev) => ({ ...prev, [goalId]: newProgress }));
    }
  };

  const handleSaveChanges = () => {
    setFeedbackMessage(null);
    const progressToUpdate = { ...pendingProgress };
    const goalsToAdd = [...pendingNewGoals];

    setPendingProgress({});
    setPendingNewGoals([]);

    startTransition(async () => {
      setOptimisticGoals({
        type: "SAVE_ALL",
        pendingProgress: progressToUpdate,
        pendingNewGoals: goalsToAdd,
      });

      try {
        const progressUpdates = Object.entries(progressToUpdate).map(
          ([id, p]) => updateGoalProgress(id, p),
        );
        const goalCreations = goalsToAdd.map((g) => addGoal(g));

        await Promise.all([...progressUpdates, ...goalCreations]);
        setFeedbackMessage({
          type: "success",
          text: "Goals saved successfully!",
        });
      } catch (err) {
        console.error("Failed to save goals:", err);
        setFeedbackMessage({
          type: "error",
          text: "Failed to save goal updates. Please try again.",
        });
      }
    });
  };

  const displayGoals: DisplayGoal[] = [
    ...optimisticGoals.map((goal) => ({
      ...goal,
      progress: pendingProgress[goal.id] ?? goal.progress,
      isModified: goal.id in pendingProgress,
      isNew: false,
    })),
    ...pendingNewGoals.map((goal, index) => ({
      id: `temp-goal-${index}`,
      user_id: "temp",
      title: goal.title,
      description: goal.description || "",
      priority: goal.priority,
      due_date: new Date(goal.due_date),
      progress: 0,
      status: "In Progress" as const,
      created_at: new Date(),
      updated_at: new Date(),
      isModified: false,
      isNew: true,
    })),
  ];

  return (
    <div className="space-y-6">
      <GoalsHeader
        unsavedCount={unsavedCount}
        hasUnsavedChanges={hasUnsavedChanges}
        isPending={isPending}
        onOpenModal={() => setIsModalOpen(true)}
        onDiscard={() => {
          setPendingProgress({});
          setPendingNewGoals([]);
          setFeedbackMessage(null);
        }}
        onSave={handleSaveChanges}
      />

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

      <div className="space-y-4">
        {displayGoals.length === 0 ? (
          <div className="text-center py-16 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-xs">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No Active Goals
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              You haven&apos;t set any performance goals yet. Establish objectives for this cycle to track your progress.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          displayGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onSliderChange={handleSliderChange}
            />
          ))
        )}
      </div>

      <AddGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGoal={(g) => setPendingNewGoals((prev) => [...prev, g])}
      />
    </div>
  );
}
