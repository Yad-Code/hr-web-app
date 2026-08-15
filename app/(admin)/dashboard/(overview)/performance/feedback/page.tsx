import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FeedbackRow } from "../types";

export const revalidate = 0;

export default async function FullFeedbackPage() {
  // Fetch all feedback without the LIMIT 5 restriction
  const allFeedback = (await db`
    SELECT 
      uf.id, uf.type, uf.text, uf.sender, uf.role, uf.date, 
      u.name as recipient_name, u.image_url as recipient_image
    FROM user_feedback uf
    JOIN users u ON uf.user_id = u.id
    ORDER BY uf.date DESC 
  `) as unknown as FeedbackRow[];

  // Reusing your existing badge logic for visual consistency
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <Link
            href="/dashboard/performance"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors mb-3 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Company-Wide Feedback
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Review all logged feedback and recognition across the team.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm ring-1 ring-inset ring-indigo-500/20">
          <MessageSquare className="w-4 h-4" />
          Log New Feedback
        </button>
      </div>

      {/* Full List Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 divide-y divide-slate-100">
          {allFeedback && allFeedback.length > 0 ? (
            allFeedback.map((item) => {
              const dateObj = new Date(item.date);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              const recipientName = item.recipient_name || "Unknown";

              return (
                <div
                  key={item.id}
                  className="py-5 first:pt-2 last:pb-2 flex flex-col sm:flex-row gap-4 sm:items-start hover:bg-slate-50/50 transition-colors rounded-xl px-2 sm:px-4 -mx-2 sm:-mx-4"
                >
                  {/* Avatar (Scaled up for full page) */}
                  <div className="shrink-0 pt-1">
                    {item.recipient_image ? (
                      <img
                        src={item.recipient_image}
                        alt={recipientName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold border border-indigo-200">
                        {recipientName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Feedback Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {recipientName}
                        </span>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          From{" "}
                          <span className="font-semibold text-slate-500">
                            {item.sender || "Anonymous"}
                          </span>{" "}
                          • {formattedDate}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border capitalize shrink-0 w-fit ${getTypeBadge(
                          item.type,
                        )}`}
                      >
                        {item.type || "Feedback"}
                      </span>
                    </div>

                    {/* Feedback Text Block */}
                    <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        &quot;{item.text}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">
                No feedback has been recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
