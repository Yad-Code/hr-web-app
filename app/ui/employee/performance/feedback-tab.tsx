// app/ui/employee/performance/feedback-tab.tsx

import { MessageSquare, User, Calendar, ClipboardList } from "lucide-react";

import { Feedback, OneOnOneMeeting } from "@/app/lib/employeeDashboard/performance/definitions";

interface FeedbackTabProps {
  feedback: Feedback[];
  meetings: OneOnOneMeeting[];
}

export default function FeedbackTab({ feedback, meetings }: FeedbackTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ================= Feedback ================= */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Continuous Feedback
        </h2>

        {feedback.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
            No feedback has been received yet.
          </div>
        ) : (
          feedback.map((fb) => (
            <div
              key={fb.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {fb.sender.charAt(0)}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">{fb.sender}</p>

                    <p className="text-xs text-slate-500">
                      {fb.role} • {new Date(fb.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    fb.type === "Positive"
                      ? "bg-emerald-100 text-emerald-700"
                      : fb.type === "Constructive"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {fb.type}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {fb.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ================= Meetings ================= */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-slate-600" />
          1:1 Meetings
        </h2>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
            No one-on-one meetings found.
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="border-l-4 border-blue-600 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {meeting.topic}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      with{" "}
                      <span className="font-medium">
                        {meeting.manager_name ?? "Manager"}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      meeting.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : meeting.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {meeting.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <Calendar className="w-4 h-4" />

                  {new Date(meeting.meeting_date).toLocaleDateString()}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">
                      Meeting Notes
                    </h4>

                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {meeting.notes}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="w-4 h-4 text-blue-600" />

                      <h4 className="font-semibold text-blue-900">
                        Action Items
                      </h4>
                    </div>

                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {meeting.action_items}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
