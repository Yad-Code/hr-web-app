// app/ui/employee/performance/modals/request-meeting-modal.tsx
"use client";

import { useState } from "react";
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
}: RequestMeetingModalProps) { // <-- Updated from EditCareerModalProps to RequestMeetingModalProps
  const [topic, setTopic] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ topic, meeting_date: meetingDate, notes });
      setTopic("");
      setMeetingDate("");
      setNotes("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-lg">Request 1:1 Manager Sync</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Topic</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Career Check-in, Project Review"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Date</label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agenda / Prep Notes</label>
            <textarea
              rows={3}
              placeholder="What would you like to discuss during this session?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
      </div>
    </div>
  );
}