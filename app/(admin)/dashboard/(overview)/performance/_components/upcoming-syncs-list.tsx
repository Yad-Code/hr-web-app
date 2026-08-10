// @/app/(admin)/dashboard/(overview)/performance/_components/upcoming-syncs-list.tsx
import { Calendar, ArrowRight } from "lucide-react";
import { MeetingRow } from "../types";
import Link from "next/link";

export function UpcomingSyncsList({ meetings }: { meetings: MeetingRow[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
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

      <div className="p-4 space-y-3">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  {meeting.employee_name}
                </span>

                {/* STATUS AND DATE BADGES */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border capitalize ${
                      meeting.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}
                  >
                    {meeting.status}
                  </span>
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                    {new Date(meeting.meeting_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {meeting.topic || "Regular Check-in"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-4">
            No upcoming meetings scheduled.
          </p>
        )}
      </div>
    </div>
  );
}
