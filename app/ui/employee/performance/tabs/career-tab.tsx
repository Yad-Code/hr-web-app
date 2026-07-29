// app/ui/employee/performance/tabs/career-tab.tsx
"use client";

import { useState } from "react";
import {
  CareerDevelopment,
  OneOnOneMeeting,
  RequestMeetingData,
  UpdateCareerData,
} from "@/app/lib/performance/definitions";
import { formatDate } from "@/app/lib/utils";
import {
  requestOneOnOne,
  updateCareerPlan,
} from "@/app/lib/performance/actions/career";
import EditCareerModal from "../modals/edit-career-modal";
import RequestMeetingModal from "../modals/request-meeting-modal";

interface CareerTabProps {
  career: CareerDevelopment | null;
  meetings: OneOnOneMeeting[];
}

export default function CareerTab({ career, meetings }: CareerTabProps) {
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [isRequestMeetingOpen, setIsRequestMeetingOpen] = useState(false);

  const handleUpdateCareer = async (data: UpdateCareerData) => {
    await updateCareerPlan(data);
  };

  const handleRequestMeeting = async (data: RequestMeetingData) => {
    await requestOneOnOne(data);
  };

  return (
    <div className="space-y-8">
      {/* Career Development Plan */}
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Career Development Plan
          </h2>
          <button
            type="button"
            onClick={() => setIsEditPlanOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors shadow-sm"
          >
            {career ? "Edit Plan" : "+ Create Plan"}
          </button>
        </div>

        {career ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Current Position
                </p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {career.current_position}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Target Position
                </p>
                <p className="text-base font-semibold text-blue-600 mt-1">
                  {career.target_position}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Target Completion Date
                </p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {formatDate(career.target_date)}
                </p>
              </div>
            </div>

            {career.roadmap && (
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">
                  Growth Roadmap
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {career.roadmap}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            No active career development plan configured.
          </p>
        )}
      </section>

      {/* 1:1 Manager Syncs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            1:1 Manager Meetings
          </h2>
          <button
            type="button"
            onClick={() => setIsRequestMeetingOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
          >
            + Request 1:1 Sync
          </button>
        </div>

        {meetings.length === 0 ? (
          <p className="text-slate-500 text-sm">No 1:1 meetings logged.</p>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 bg-white border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {meeting.topic || "Regular Sync"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      With {meeting.manager_name || "Manager"} on{" "}
                      {formatDate(meeting.meeting_date)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      meeting.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {meeting.status}
                  </span>
                </div>

                {meeting.notes && (
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md mt-2">
                    <strong className="text-slate-700">Notes:</strong>{" "}
                    {meeting.notes}
                  </p>
                )}

                {meeting.action_items && (
                  <p className="text-sm text-slate-600 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                    <strong className="text-blue-800">Action Items:</strong>{" "}
                    {meeting.action_items}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <EditCareerModal
        key={isEditPlanOpen ? "edit-career-open" : "edit-career-closed"}
        isOpen={isEditPlanOpen}
        career={career}
        onClose={() => setIsEditPlanOpen(false)}
        onSubmit={handleUpdateCareer}
      />

      <RequestMeetingModal
        key={
          isRequestMeetingOpen
            ? "request-meeting-open"
            : "request-meeting-closed"
        }
        isOpen={isRequestMeetingOpen}
        onClose={() => setIsRequestMeetingOpen(false)}
        onSubmit={handleRequestMeeting}
      />
    </div>
  );
}
