// @/app/(admin)/dashboard/(overview)/performance/meetings/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Mail,
  FileText,
  ListChecks,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getMeetingDetailsById } from "@/app/lib/admin/performance/data";
import { updateMeetingStatus } from "@/app/lib/admin/performance/actions";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = await getMeetingDetailsById(id);

  if (!meeting) {
    notFound();
  }

  const dateObj = new Date(meeting.meeting_date);
  const formattedDate = !isNaN(dateObj.getTime())
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(dateObj)
    : "TBD";

  const formattedTime = !isNaN(dateObj.getTime())
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(dateObj)
    : "";

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "scheduled":
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Navigation */}
      <Link
        href="/dashboard/performance/meetings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to 1-on-1 Meetings
      </Link>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize tracking-wide ${getStatusBadge(
                meeting.status,
              )}`}
            >
              {meeting.status}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ID: {meeting.id.slice(0, 8)}...
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {meeting.topic || "Regular 1-on-1 Check-in"}
          </h1>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {meeting.status.toLowerCase() !== "completed" && (
            <form
              action={async () => {
                "use server";
                await updateMeetingStatus(meeting.id, "Completed");
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Completed
              </button>
            </form>
          )}

          {meeting.status.toLowerCase() !== "cancelled" && (
            <form
              action={async () => {
                "use server";
                await updateMeetingStatus(meeting.id, "Cancelled");
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-xs"
              >
                <XCircle className="w-4 h-4" /> Cancel Meeting
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content (Agenda, Notes, Action Items) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Meeting Agenda & Notes
            </h2>
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed min-h-25">
              {meeting.notes ? (
                <p className="whitespace-pre-line">{meeting.notes}</p>
              ) : (
                <p className="text-slate-400 italic">
                  No notes recorded for this meeting.
                </p>
              )}
            </div>
          </div>

          {/* Action Items Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-600" />
              Action Items & Follow-ups
            </h2>
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed min-h-20">
              {meeting.action_items ? (
                <p className="whitespace-pre-line">{meeting.action_items}</p>
              ) : (
                <p className="text-slate-400 italic">
                  No action items assigned.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Meta Information */}
        <div className="space-y-6">
          {/* Participant Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Participants
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Employee</p>
                  <p className="text-sm font-bold text-slate-900">
                    {meeting.employee_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    Department
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {meeting.department}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-xs font-medium text-slate-700 truncate max-w-45">
                    {meeting.employee_email}
                  </p>
                </div>
              </div>

              {meeting.manager_name && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Host / Manager
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {meeting.manager_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Schedule Details
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {formattedTime && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Time</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formattedTime}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
