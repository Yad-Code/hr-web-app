// app/ui/employee/performance/modals/edit-career-modal.tsx
"use client";

import { useState } from "react";
import { ModalWrapper } from "@/app/ui/components/modal-wrapper";
import {
  CareerDevelopment,
  UpdateCareerData,
} from "@/app/lib/employeeDashboard/performance/definitions";

interface EditCareerModalProps {
  isOpen: boolean;
  career: CareerDevelopment | null;
  onClose: () => void;
  onSubmit: (data: UpdateCareerData) => Promise<void>;
}

export default function EditCareerModal({
  isOpen,
  career,
  onClose,
  onSubmit,
}: EditCareerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);

    try {
      await onSubmit({
        current_position: formData.get("currentPosition") as string,
        target_position: formData.get("targetPosition") as string,
        target_date: formData.get("targetDate") as string,
        roadmap: formData.get("roadmap") as string,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Career Development Plan"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="currentPosition"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Current Position
          </label>
          <input
            id="currentPosition"
            name="currentPosition"
            type="text"
            required
            defaultValue={career?.current_position || ""}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="targetPosition"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Target Position
          </label>
          <input
            id="targetPosition"
            name="targetPosition"
            type="text"
            required
            defaultValue={career?.target_position || ""}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="targetDate"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Target Completion Date
          </label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            required
            defaultValue={
              career?.target_date
                ? new Date(career.target_date).toISOString().split("T")[0]
                : ""
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="roadmap"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Growth Roadmap & Goals
          </label>
          <textarea
            id="roadmap"
            name="roadmap"
            rows={4}
            defaultValue={career?.roadmap || ""}
            placeholder="Outline steps, skills to gain, or milestones..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg"
          >
            {isSubmitting ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
