// app/ui/employee/performance/modals/edit-goal-modal.tsx
"use client";

import { useTransition, useState } from "react";
import { ModalWrapper } from "@/app/ui/components/modal-wrapper";
import { Goal } from "@/app/lib/employeeDashboard/performance/definitions";
import { updateGoal } from "@/app/lib/employeeDashboard/performance/actions/goals";

interface EditGoalModalProps {
  goal: Goal;
  onClose: () => void;
}

export default function EditGoalModal({ goal, onClose }: EditGoalModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await updateGoal(goal.id, formData);
      if (res.success) {
        onClose();
      } else if (res.errors) {
        setErrors(res.errors);
      }
    });
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Edit Goal"
      maxWidth="max-w-lg"
    >
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            defaultValue={goal.title}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={goal.description}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              defaultValue={goal.priority}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              defaultValue={String(goal.due_date).split("T")[0]}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
