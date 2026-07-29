// app/ui/employee/performance/modals/request-feedback-modal.tsx
"use client";

import { useState, useTransition, FormEvent } from "react";
import { requestFeedback } from "@/app/lib/employeeDashboard/performance/actions/feedback";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestFeedbackModal({ isOpen, onClose }: ModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      setError(null);
      const result = await requestFeedback(formData);
      if (result.success) {
        onClose();
      } else {
        setError("Failed to send request. Check server logs.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Request Feedback</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Recipient
            </label>
            <select
              name="recipient"
              required
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="admin@company.com">
                Admin Manager (admin@company.com)
              </option>
              <option value="lana@company.com">
                Lana Amin (lana@company.com)
              </option>
              <option value="diyar@company.com">
                Diyar Karwan (diyar@company.com)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topic / Focus Area
            </label>
            <select
              name="type"
              required
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Code Quality & Architecture">
                Code Quality & Architecture
              </option>
              <option value="Project Collaboration">
                Project Collaboration
              </option>
              <option value="Sprint Deliverables">Sprint Deliverables</option>
              <option value="General Performance">General Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Specific Message or Question
            </label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="e.g. Could you provide feedback on the Next.js migration PR?"
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
