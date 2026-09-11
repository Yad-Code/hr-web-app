"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessageSquarePlus } from "lucide-react";
import { OpenAssessmentModal } from "./open-assessment-modal";
import { User } from "next-auth";

export function AdminPerformanceControls({ user }: { user: User }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        {user.canLogFeedback && (
          <Link
            href="/dashboard/performance/feedback/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-slate-400" />
            Log Feedback
          </Link>
        )}

        <Link
          href="/dashboard/performance/goals/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-slate-400" />
          New Goal
        </Link>

        {user.isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-all shadow-sm ring-1 ring-inset ring-slate-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Open Assessment
          </button>
        )}

        {user.canStartReviews && (
          <Link
            href="/dashboard/performance/reviews/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm ring-1 ring-inset ring-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Start Review
          </Link>
        )}
      </div>

      {user.isAdmin && (
        <OpenAssessmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
