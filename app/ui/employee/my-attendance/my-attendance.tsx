"use client";

import { useState, useTransition } from "react";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Briefcase, 
  FileText,
  Loader2,
  X,
  Plus
} from "lucide-react";
import { AttendanceData } from "@/app/lib/data/attendance";
import { toggleCheckInStatus, submitWFHRequest } from "@/app/lib/actions";

export function SectionHeader({
  title,
  description, 
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function TodayStatusCard({ data }: { data: AttendanceData["today"] }) {
  const [isPending, startTransition] = useTransition();

  const isCheckedIn = Boolean(data.checkIn);
  const isCheckedOut = Boolean(data.checkOut);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCheckInStatus();
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Todays Status
        </span>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {data.status}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending || isCheckedOut}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isCheckedOut ? (
              "Done For Today"
            ) : isCheckedIn ? (
              "Check Out"
            ) : (
              "Check In"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <p className="text-[11px] font-medium text-slate-400">Check In</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {data.checkIn || "--:--"}
          </p>
        </div>
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <p className="text-[11px] font-medium text-slate-400">Check Out</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {data.checkOut || "--:--"}
          </p>
        </div>
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <p className="text-[11px] font-medium text-slate-400">Location</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-500" />
            {data.workLocation}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AttendanceStatsGrid({
  summary,
  leaveBalance,
}: {
  summary: AttendanceData["summary"];
  leaveBalance: AttendanceData["leaveBalance"];
}) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-left">
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs">
        <p className="text-xs font-medium text-slate-400">Attendance Rate</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {summary.attendanceRate}%
        </p>
      </div>
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs">
        <p className="text-xs font-medium text-slate-400">Days Present</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {summary.daysPresent}
        </p>
      </div>
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs">
        <p className="text-xs font-medium text-slate-400">Late Arrivals</p>
        <p className="text-2xl font-bold text-amber-600 mt-1">
          {summary.lateArrivals}
        </p>
      </div>
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs">
        <p className="text-xs font-medium text-slate-400">Leave Remaining</p>
        <p className="text-2xl font-bold text-indigo-600 mt-1">
          {leaveBalance.annualRemaining} Days
        </p>
      </div>
    </div>
  );
}

export function AttendanceCalendar({
  currentMonth,
  currentYear,
  calendarDays,
}: {
  currentMonth: string;
  currentYear: number;
  calendarDays: AttendanceData["calendarDays"];
}) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">
          {currentMonth} {currentYear}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day) => (
          <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((item, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl text-center border text-xs min-h-[48px] flex flex-col items-center justify-between transition-all ${
              !item.date
                ? "border-transparent bg-transparent"
                : item.status === "present"
                ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                : item.status === "late"
                ? "bg-amber-50/50 border-amber-100 text-amber-900"
                : item.status === "absent"
                ? "bg-rose-50/50 border-rose-100 text-rose-900"
                : "bg-slate-50 border-slate-100 text-slate-600"
            }`}
          >
            <span className="font-semibold text-[11px]">{item.date || ""}</span>
            {item.status && (
              <span className="text-[9px] font-bold tracking-tight opacity-80">
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShiftSummaryCard({ data }: { data?: AttendanceData["today"] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Shift Info</h3>
      <p className="text-xs text-slate-500">
        Default: 09:00 AM – 05:00 PM (Mon - Fri)
      </p>
    </div>
  );
}

export function LeaveBalanceCard({
  leaveBalance,
}: {
  leaveBalance: AttendanceData["leaveBalance"];
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Leave Balances</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Annual Leave</span>
          <span className="font-semibold">{leaveBalance.annualRemaining} / {leaveBalance.annualTotal} days</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Sick Leave</span>
          <span className="font-semibold">{leaveBalance.sickRemaining} / {leaveBalance.sickTotal} days</span>
        </div>
      </div>
    </div>
  );
}

export function AttendanceLogTable({
  logs,
}: {
  logs: AttendanceData["attendanceLog"];
  month: string;
  year: number;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden text-left">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Attendance History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3">Work Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">{log.date}</td>
                <td className="px-4 py-3">{log.checkIn || "--:--"}</td>
                <td className="px-4 py-3">{log.checkOut || "--:--"}</td>
                <td className="px-4 py-3">{log.workHours || "--"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    log.status === "Present"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WFHRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitWFHRequest(formData);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer z-40"
      >
        <Plus className="w-4 h-4" />
        Request WFH
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Request Work From Home</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Reason
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  placeholder="Provide brief details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}