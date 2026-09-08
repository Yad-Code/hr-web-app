// app/ui/employee/performance/components/add-goal-modal.tsx
"use client";

import { ModalWrapper } from "@/app/ui/components/modal-wrapper";

export interface NewGoalData {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  due_date: string;
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: NewGoalData) => void;
}

export default function AddGoalModal({
  isOpen,
  onClose,
  onAddGoal,
}: AddGoalModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as "Low" | "Medium" | "High";
    const dueDate = formData.get("dueDate") as string;

    if (!title.trim() || !dueDate) return;

    onAddGoal({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate,
    });

    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add New Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Goal Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g., Complete AWS Solutions Architect Certification"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Outline specific objectives or key results..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="priority"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="Medium"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Goal
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
