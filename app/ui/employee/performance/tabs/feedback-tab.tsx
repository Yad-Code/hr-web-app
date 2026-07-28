// app/ui/employee/performance/tabs/feedback-tab.tsx
"use client";

import { useTransition } from "react";
import { Feedback } from "@/app/lib/performance/definitions";
import { markFeedbackAsRead } from "@/app/lib/performance/actions/feedback";
import { formatDate } from "@/app/lib/utils";

export default function FeedbackTab({ feedbackList }: { feedbackList: Feedback[] }) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (feedbackId: string) => {
    startTransition(async () => {
      await markFeedbackAsRead(feedbackId); // Uses the server action[cite: 5]
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Continuous Feedback</h2>
      {feedbackList.length === 0 ? (
        <p className="text-slate-500">No feedback received yet.</p>
      ) : (
        feedbackList.map((feedback) => (
          <div 
            key={feedback.id} 
            className={`p-4 border rounded-lg transition-colors ${
              feedback.is_read ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {feedback.type}
                </span>
                <p className="mt-1 text-slate-800">{feedback.text}</p>
                <p className="text-xs text-slate-500 mt-2">
                  From {feedback.sender} ({feedback.role}) on {formatDate(feedback.date)}
                </p>
              </div>
              
              {!feedback.is_read && (
                <button
                  onClick={() => handleMarkAsRead(feedback.id)}
                  disabled={isPending}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap ml-4"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}