// app/ui/employee/performance/modals/edit-goal-modal.tsx
"use client";

import { useTransition, useState } from "react";
import { Goal } from "@/app/lib/employeeDashboard/performance/definitions";
import { updateGoal } from "@/app/lib/employeeDashboard/performance/actions/goals";

interface EditGoalModalProps {
  goal: Goal;
  onClose: () => void;
}

export default function EditGoalModal({ goal, onClose }: EditGoalModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await updateGoal(goal.id, formData); // Triggers updateGoal action
      if (res.success) {
        onClose();
      } else if (res.errors) {
        setErrors(res.errors); // Captures validation errors from GoalSchema
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">Edit Goal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Title</label>
            <input 
              type="text" 
              name="title" 
              defaultValue={goal.title} 
              className="w-full p-2 border border-slate-300 rounded-md text-sm mt-1"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <textarea 
              name="description" 
              defaultValue={goal.description} 
              rows={3} 
              className="w-full p-2 border border-slate-300 rounded-md text-sm mt-1"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Priority</label>
              <select 
                name="priority" 
                defaultValue={goal.priority} 
                className="w-full p-2 border border-slate-300 rounded-md text-sm mt-1 bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Due Date</label>
              <input 
                type="date" 
                name="due_date" 
                defaultValue={String(goal.due_date).split("T")[0]} 
                className="w-full p-2 border border-slate-300 rounded-md text-sm mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}