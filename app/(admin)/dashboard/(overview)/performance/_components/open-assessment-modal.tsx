// @/app/(admin)/dashboard/(overview)/performance/modals/initiate-selfAssessment.tsx

"use client";

import { useTransition, useState } from "react";
import { ModalWrapper } from "@/app/ui/components/modal-wrapper";
import { initiateSelfAssessmentCycle } from "@/app/lib/admin/performance/actions";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenAssessmentModal({ isOpen, onClose }: ModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      setError(null);
      const result = await initiateSelfAssessmentCycle(formData);

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to create cycle.");
      }
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Open Assessment Cycle"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="cycleName"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Cycle Name
          </label>
          <input
            id="cycleName"
            name="cycleName"
            type="text"
            required
            placeholder="e.g., Q4 2026 or 2027 Annual Review"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPending ? "Creating..." : "Start Cycle"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
