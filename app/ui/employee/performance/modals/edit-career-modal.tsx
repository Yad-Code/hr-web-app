// app/ui/employee/performance/modals/edit-career-modal.tsx
"use client";

import { useState } from "react";
import { CareerDevelopment, UpdateCareerData } from "@/app/lib/performance/definitions";

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
  // Initialize state directly from props (No useEffect needed)
  const [currentPosition, setCurrentPosition] = useState(career?.current_position || "");
  const [targetPosition, setTargetPosition] = useState(career?.target_position || "");
  const [targetDate, setTargetDate] = useState(
    career?.target_date ? new Date(career.target_date).toISOString().split("T")[0] : ""
  );
  const [roadmap, setRoadmap] = useState(career?.roadmap || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        current_position: currentPosition,
        target_position: targetPosition,
        target_date: targetDate,
        roadmap,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-lg">Edit Career Development Plan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Position</label>
            <input
              type="text"
              required
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Position</label>
            <input
              type="text"
              required
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Roadmap & Goals</label>
            <textarea
              rows={4}
              value={roadmap}
              onChange={(e) => setRoadmap(e.target.value)}
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
      </div>
    </div>
  );
}