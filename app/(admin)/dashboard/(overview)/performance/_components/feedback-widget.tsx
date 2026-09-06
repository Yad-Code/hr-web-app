"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { MessageSquare, Bell, CheckCircle, ArrowRight } from "lucide-react";
import { FeedbackRequestRow, FeedbackRow } from "../types";
import ProvideFeedbackModal from "../modals/provide-feedback-modal";

interface FeedbackWidgetProps {
  feedback: FeedbackRow[];
  requests: FeedbackRequestRow[];
  isAdmin?: boolean;
}
export function FeedbackWidget({
  feedback,
  requests,
  isAdmin = true,
}: FeedbackWidgetProps) {
  
  const [activeTab, setActiveTab] = useState<"feed" | "requests">(
    requests.length > 0 ? "requests" : "feed",
  );

  const [respondingTo, setRespondingTo] = useState<FeedbackRequestRow | null>(
    null,
  );

  const getTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "constructive":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200/80";
    }
  };

  return (
    <>
      {respondingTo && (
        <ProvideFeedbackModal
          request={respondingTo}
          onClose={() => setRespondingTo(null)}
        />
      )}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-100">
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("feed")}
                className={`text-sm font-bold flex items-center gap-2 py-2 border-b-2 transition-colors ${
                  activeTab === "feed"
                    ? "border-indigo-600 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {isAdmin ? "Company Feed" : "Team Feed"}
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`text-sm font-bold flex items-center gap-2 py-2 border-b-2 transition-colors ${
                  activeTab === "requests"
                    ? "border-amber-500 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Bell className="w-4 h-4" />
                Requests
                {requests.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    {requests.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "feed" && (
              <Link
                href="/dashboard/performance/feedback"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          {/* --- FEED TAB --- */}
          {activeTab === "feed" &&
            (feedback.length > 0 ? (
              feedback.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/performance/feedback#feedback-${item.id}`}
                  className="block p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group space-y-2 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {item.recipient_image ? (
                        <div className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all">
                          <Image
                            src={item.recipient_image}
                            alt={item.recipient_name || "User"}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-200 shrink-0">
                          {(item.recipient_name || "U").charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {item.recipient_name || "Unknown"}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          From{" "}
                          <span className="font-semibold text-slate-500">
                            {item.sender || "Anonymous"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${getTypeBadge(item.type)}`}
                    >
                      {item.type || "Feedback"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 pl-12 italic">
                    &quot;{item.text}&quot;
                  </p>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-400">
                  No recent feedback logged.
                </p>
              </div>
            ))}

          {/* --- REQUESTS TAB --- */}
          {activeTab === "requests" &&
            (requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {req.title}
                      </span>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {req.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setRespondingTo(req)}
                      className="text-[10px] font-bold px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Provide Feedback
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-200" />
                <p className="text-xs font-medium text-slate-400">
                  No pending requests.
                </p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
