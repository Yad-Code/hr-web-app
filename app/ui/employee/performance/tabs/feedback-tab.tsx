// app/ui/employee/performance/tabs/feedback-tab.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Feedback,
  Colleague,
} from "@/app/lib/employeeDashboard/performance/definitions";
import {
  markFeedbackAsRead,
  markAllFeedbackAsRead,
} from "@/app/lib/employeeDashboard/performance/actions/feedback";
import { formatDate } from "@/app/lib/utils";
import RequestFeedbackModal from "../modals/request-feedback-modal";

export default function FeedbackTab({
  feedbackList,
  colleagues,
}: {
  feedbackList: Feedback[];
  colleagues: Colleague[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unreadCount = feedbackList.filter((f) => !f.is_read).length;

  const handleMarkAsRead = (feedbackId: string) => {
    startTransition(async () => {
      await markFeedbackAsRead(feedbackId);
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllFeedbackAsRead();
    });
  };

  const filteredList = feedbackList.filter((item) => {
    if (activeFilter === "unread") return !item.is_read;
    if (activeFilter === "all") return true;
    return item.type.toLowerCase() === activeFilter.toLowerCase();
  });

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "positive":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "recognition":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "constructive":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Request Feedback Modal */}
      <RequestFeedbackModal
        isOpen={true}
        onClose={() => {}}
        colleagues={colleagues}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              Continuous Feedback
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time feedback and recognition from peers and managers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 px-2 py-1"
            >
              Mark all as read
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Request Feedback
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "all", label: "All Feedback" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "positive", label: "Positive" },
          { id: "recognition", label: "Recognition" },
          { id: "constructive", label: "Constructive" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeFilter === tab.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">
            No feedback matches the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((feedback) => (
            <div
              key={feedback.id}
              className={`p-4 rounded-xl border transition-all ${
                feedback.is_read
                  ? "bg-white border-slate-200 shadow-xs"
                  : "bg-blue-50/50 border-blue-200 shadow-xs ring-1 ring-blue-100"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getTypeBadge(
                        feedback.type,
                      )}`}
                    >
                      {feedback.type}
                    </span>
                    {!feedback.is_read && (
                      <span
                        className="h-2 w-2 rounded-full bg-blue-600"
                        title="Unread"
                      />
                    )}
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {feedback.text}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">
                      {feedback.sender}
                    </span>
                    <span>•</span>
                    <span>{feedback.role}</span>
                    <span>•</span>
                    <span>{formatDate(feedback.date)}</span>
                  </div>
                </div>

                {!feedback.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(feedback.id)}
                    disabled={isPending}
                    className="text-xs font-medium bg-white border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 whitespace-nowrap shadow-xs transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
