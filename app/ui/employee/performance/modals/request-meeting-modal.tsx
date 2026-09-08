// app/ui/employee/performance/modals/request-meeting-modal.tsx
"use client";

import { useState } from "react";
import { ModalWrapper } from "@/app/ui/components/modal-wrapper";
import { RequestMeetingData } from "@/app/lib/employeeDashboard/performance/definitions";

interface RequestMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequestMeetingData) => Promise<void>;
}

export default function RequestMeetingModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestMeetingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);
    try {
      await onSubmit({
        topic: formData.get("topic") as string,
        meeting_date: formData.get("meetingDate") as string,
        notes: formData.get("notes") as string,
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
      title="Request 1:1 Manager Sync"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="topic"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Meeting Topic
          </label>
          <input
            id="topic"
            name="topic"
            type="text"
            required
            placeholder="e.g. Monthly Career Check-in, Project Review"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="meetingDate"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Proposed Date & Time
          </label>
          <input
            id="meetingDate"
            name="meetingDate"
            type="datetime-local"
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Agenda / Prep Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="What would you like to discuss during this session?"
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
            {isSubmitting ? "Requesting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
