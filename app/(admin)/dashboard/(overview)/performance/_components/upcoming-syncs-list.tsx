// @/app/(admin)/dashboard/(overview)/performance/_components/upcoming-syncs-list.tsx
import { Calendar, ArrowRight } from "lucide-react";
import { MeetingRow } from "../types";
import Link from "next/link";

export function UpcomingSyncsList({ meetings }: { meetings: MeetingRow[] }) {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "pending":
      case "scheduled":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          1-on-1 Sync Schedule
        </h2>
        <Link
          href="/dashboard/performance/meetings"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List Container */}
      <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
        {meetings && meetings.length > 0 ? (
          meetings.map((meeting) => {
            const dateObj = new Date(meeting.meeting_date);
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD";

            return (
              <Link
                key={meeting.id}
                href={`/dashboard/performance/meetings/${meeting.id}`}
                className="block p-3 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-100 hover:border-purple-200 transition-all hover:shadow-xs group space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                      {meeting.employee_name}
                    </span>
                    {meeting.department && (
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        • {meeting.department}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${getStatusBadge(
                        meeting.status,
                      )}`}
                    >
                      {meeting.status}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 truncate group-hover:text-slate-600">
                  {meeting.topic || "Regular Check-in"}
                </p>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-medium text-slate-400">
              No upcoming meetings scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
