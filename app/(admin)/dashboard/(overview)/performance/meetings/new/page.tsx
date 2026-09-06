// @/app/(admin)/dashboard/(overview)/performance/meetings/new/page.tsx
import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  User,
  Calendar,
  FileText,
  ListChecks,
} from "lucide-react";
import { getEmployeesList } from "@/app/lib/admin/performance/data";
import { scheduleOneOnOneMeeting } from "@/app/lib/admin/performance/actions";
import { auth } from "@/auth";

export default async function ScheduleMeetingPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const employees = await getEmployeesList();

  return (
    <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href="/dashboard/performance/meetings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to 1-on-1 Meetings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarPlus className="w-7 h-7 text-purple-600" />
          Schedule a 1-on-1 Sync
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin
            ? "Set up a new performance review or check-in session with any employee."
            : "Set up a new performance review or check-in session with your direct reports."}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <form action={scheduleOneOnOneMeeting} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Select Manager /
              Host
            </label>
            <select
              name="manager_id"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            >
              <option value="">-- Choose a manager --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Select Employee
            </label>
            <select
              name="employee_id"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            >
              <option value="">-- Choose an employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time
            </label>
            <input
              type="datetime-local"
              name="meeting_date"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Meeting Topic
            </label>
            <input
              type="text"
              name="topic"
              placeholder="e.g. Q3 Goal Review & Career Check-in"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Agenda &
              Preparation Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Add key talking points, feedback, or goals to cover..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-slate-400" /> Action Items
              & Follow-ups
            </label>
            <textarea
              name="action_items"
              rows={3}
              placeholder="List any pending tasks, required updates, or immediate follow-ups..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              href="/dashboard/performance/meetings"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" /> Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
