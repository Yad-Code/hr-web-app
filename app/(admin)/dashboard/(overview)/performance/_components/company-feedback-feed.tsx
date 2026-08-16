// @/app/(admin)/dashboard/(overview)/performance/_components/company-feedback-feed.tsx

import { MessageSquare, ArrowRight } from "lucide-react";
import { FeedbackRow } from "../types";
import Link from "next/link";
import Image from "next/image";

interface CompanyFeedbackFeedProps {
  feedback: FeedbackRow[];
}

export function CompanyFeedbackFeed({ feedback }: CompanyFeedbackFeedProps) {
  // Helper for dynamic badge styling matching other components
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
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          Company-Wide Feedback
        </h2>
        <Link
          href="/dashboard/performance/feedback"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List Container */}
      <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
        {feedback && feedback.length > 0 ? (
          feedback.map((item) => {
            // Safe date formatting
            const dateObj = new Date(item.date);
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Recent";

            // 👇 SAFE FALLBACK: Ensure recipientName is never undefined
            const recipientName = item.recipient_name || "Unknown";

            return (
              <div
                key={item.id}
                className="block p-3 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-xs group space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {item.recipient_image ? (
                      <Image
                        src={item.recipient_image}
                        alt={recipientName}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-200 shrink-0">
                        {recipientName.charAt(0)}
                      </div>
                    )}

                    {/* Name & Meta */}
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors block">
                        {recipientName}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        From{" "}
                        <span className="font-semibold text-slate-500">
                          {item.sender || "Anonymous"}
                        </span>{" "}
                        • {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${getTypeBadge(
                      item.type,
                    )}`}
                  >
                    {item.type || "Feedback"}
                  </span>
                </div>

                {/* Feedback Text */}
                <p className="text-[11px] text-slate-500 group-hover:text-slate-600 line-clamp-2 pl-12 italic">
                  &quot;{item.text}&quot;
                </p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-medium text-slate-400">
              No recent feedback logged.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
