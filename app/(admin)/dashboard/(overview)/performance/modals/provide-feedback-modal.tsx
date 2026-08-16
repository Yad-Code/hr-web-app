// app/ui/employee/performance/modals/provide-feedback-modal.tsx
"use client";

import { useState, useTransition } from "react";
import { FeedbackRequestRow } from "../types";
import { submitFeedbackResponse } from "@/app/lib/employeeDashboard/performance/actions/feedback";

interface ModalProps {
  request: FeedbackRequestRow;
  onClose: () => void;
}

export default function ProvideFeedbackModal({ request, onClose }: ModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    // Add the original request ID so we can mark it as read/completed on the backend
    formData.append("requestId", request.id);

    startTransition(async () => {
      const result = await submitFeedbackResponse(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to submit feedback.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Provide Feedback</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Responding to:{" "}
              <span className="font-semibold text-slate-700">
                {request.title}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback Type
            </label>
            <select
              name="type"
              required
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
            >
              <option value="Positive">Positive / Recognition</option>
              <option value="Constructive">Constructive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Feedback
            </label>
            <textarea
              name="text"
              required
              rows={4}
              placeholder="Provide your feedback here..."
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
