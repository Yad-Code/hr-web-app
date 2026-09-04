"use client";
 
import { useState, useTransition, useMemo } from "react";
import {
  MapPin,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
} from "lucide-react";

import {
  TodayAttendance,
  AttendanceSummary,
  LeaveBalance, 
  AttendanceLog,
} from "@/app/lib/employeeDashboard/attendance/definitions";

import {
  toggleCheckInStatus,
  submitWFHRequest,
} from "@/app/lib/employeeDashboard/employee/actions";
import { respondToExchangeRequest } from "@/app/lib/employeeDashboard/employee/actions";

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

export function TodayStatusCard({ data }: { data?: TodayAttendance }) {
  const [isPending, startTransition] = useTransition();
  const [location, setLocation] = useState<"Office" | "Remote">("Office");

  const isCheckedIn = Boolean(data?.checkIn);
  const isCheckedOut = Boolean(data?.checkOut);

  const shiftStart = data?.shiftStart || "09:00 AM";
  const shiftEnd = data?.shiftEnd || "05:00 PM";
  const shiftType = data?.shiftType || "Standard (Mon - Fri)";

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCheckInStatus(location);
      if (!res?.success) {
        alert(res?.error || "An error occurred while updating status.");
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Today s Status
          </span>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {shiftType} • {shiftStart} - {shiftEnd}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {data?.status || "Not Checked In"}
          </span>

          {/* Location Selector (Hidden after initial check-in) */}
          {!isCheckedIn && (
            <select
              value={location}
              onChange={(e) =>
                setLocation(e.target.value as "Office" | "Remote")
              }
              disabled={isPending}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="Office">🏢 Office</option>
              <option value="Remote">🏠 Remote</option>
            </select>
          )}

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

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Check In
          </p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {data?.checkIn || "--:--"}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Check Out
          </p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {data?.checkOut || "--:--"}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-500" /> Location
          </p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {isCheckedIn ? data?.workLocation : location}
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
  summary: AttendanceSummary;
  leaveBalance: LeaveBalance;
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

interface AttendanceCalendarProps {
  logs?: AttendanceLog[];  
  workingDays?: number[]; 
  overrides?: { date: string; isWorking: boolean }[]; 
}

export function AttendanceCalendar({
  logs = [],
  workingDays = [1, 2, 3, 4, 5],
  overrides = [],  
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthIndex = currentDate.getMonth();
  const yearNum = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Calculate calendar grid
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const startDayOfWeek = new Date(yearNum, monthIndex, 1).getDay();

  // Create padding for the first row
  const paddedDays = [
    ...Array.from({ length: startDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Navigation handlers (Instant, no server reload)
  const prevMonth = () => setCurrentDate(new Date(yearNum, monthIndex - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(yearNum, monthIndex + 1, 1));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-left h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-900 w-32">
            {monthName} {yearNum}
          </h3>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span>Work Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Off Day</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day, idx) => (
          <span
            key={day}
            className={`text-[10px] font-bold uppercase tracking-wider ${
              workingDays.includes(idx) ? "text-slate-700" : "text-slate-300"
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 flex-1">
        {paddedDays.map((dayNum, idx) => {
          if (dayNum === null) {
            return (
              <div
                key={`pad-${idx}`}
                className="min-h-[3.5rem] bg-slate-50/30 rounded-xl border border-dashed border-slate-100"
              />
            );
          }

          const dateObj = new Date(yearNum, monthIndex, dayNum);
          const dateString = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          let isWorkingDay = workingDays.includes(dateObj.getDay());
          let overrideBadge = null;

          const override = overrides.find((o) => o.date === dateString);
          if (override) {
            isWorkingDay = override.isWorking;
            overrideBadge = override.isWorking
              ? "Shift Swapped In"
              : "Shift Swapped Out";
          }

          const logForDay = logs.find((log) => log.date === dateString);
          const status = logForDay?.status?.toLowerCase();

          let bgClass = "bg-white border-slate-200 text-slate-800";
          let statusText = overrideBadge || "Scheduled";

          if (!isWorkingDay) {
            bgClass =
              "bg-slate-50/50 border-slate-100 text-slate-400 opacity-70";
            statusText = overrideBadge || "Off";
          } else if (status === "present") {
            bgClass = "bg-emerald-50 border-emerald-200 text-emerald-900";
            statusText = "Present";
          } else if (status === "late") {
            bgClass = "bg-amber-50 border-amber-200 text-amber-900";
            statusText = "Late";
          } else if (status === "absent") {
            bgClass = "bg-rose-50 border-rose-200 text-rose-900";
            statusText = "Absent";
          } else if (status === "on leave") {
            bgClass = "bg-purple-50 border-purple-200 text-purple-900";
            statusText = "Leave";
          }

          return (
            <div
              key={`day-${dayNum}`}
              className={`p-2 rounded-xl text-center border min-h-[3.5rem] flex flex-col justify-between ${bgClass}`}
            >
              <span className="font-bold text-[11px]">{dayNum}</span>
              <span className="text-[9px] font-bold uppercase">
                {statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ShiftSummaryCard({ data }: { data?: TodayAttendance }) {
  const shiftStart = data?.shiftStart || "09:00 AM";
  const shiftEnd = data?.shiftEnd || "05:00 PM";
  const shiftType = data?.shiftType || "Standard (Mon - Fri)";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Shift Info</h3>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700">
          {shiftStart} – {shiftEnd}
        </p>
        <p className="text-xs text-slate-500">{shiftType}</p>
      </div>
    </div>
  );
}

export function LeaveBalanceCard({
  leaveBalance,
}: {
  leaveBalance: LeaveBalance;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Leave Balances</h3>
      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center p-2 bg-indigo-50/50 rounded-lg border border-indigo-50">
          <span className="text-indigo-900 font-medium">Monthly Time-Off</span>
          <span className="font-bold text-indigo-700">
            {leaveBalance.monthlyRemainingHours} /{" "}
            {leaveBalance.monthlyTotalHours} hrs
          </span>
        </div>

        <div className="flex justify-between text-slate-600 px-1">
          <span>Annual Leave</span>
          <span className="font-semibold">
            {leaveBalance.annualRemaining} / {leaveBalance.annualTotal} days
          </span>
        </div>
        <div className="flex justify-between text-slate-600 px-1">
          <span>Sick Leave</span>
          <span className="font-semibold">
            {leaveBalance.sickRemaining} / {leaveBalance.sickTotal} days
          </span>
        </div>
      </div>
    </div>
  );
}

export function AttendanceLogTable({
  logs,
  month,
  year,
}: {
  logs: AttendanceLog[];
  month?: string;
  year?: number;
}) { 
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date();
    if (month && year) {
      date.setMonth(new Date(Date.parse(`${month} 1, 2000`)).getMonth());
      date.setFullYear(year);
    }
    return date;
  });

  const [statusFilter, setStatusFilter] = useState("All");

  // Filter instantly without hitting the server
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.date);
      const matchesMonth =
        logDate.getMonth() === currentDate.getMonth() &&
        logDate.getFullYear() === currentDate.getFullYear();
      const matchesStatus =
        statusFilter === "All" ||
        log.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesMonth && matchesStatus;
    });
  }, [logs, currentDate, statusFilter]);

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const yearNum = currentDate.getFullYear();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden text-left flex flex-col">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Attendance History
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 outline-none bg-transparent cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 w-24 text-center">
              {monthName} {yearNum}
            </span>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Check In</th>
              <th className="px-5 py-3">Check Out</th>
              <th className="px-5 py-3">Work Hours</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text-slate-800">
                    {log.date}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-600">
                    {log.checkIn || "--:--"}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-600">
                    {log.checkOut || "--:--"}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-600">
                    {log.workHours || "--"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {log.location || "Office"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                        log.status === "Present"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                          : log.status === "Late"
                            ? "bg-amber-50 text-amber-700 border border-amber-100/50"
                            : "bg-rose-50 text-rose-700 border border-rose-100/50"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    No attendance logs found for {monthName}.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Check a different month or clear your filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
type RequestType = "wfh" | "timeoff" | "dayoff" | "exchange";
type LeaveCategory = "annual" | "sick" | "unpaid";

export function AbsenceRequestModal({
  leaveBalance,
  colleagues = [],
}: {
  leaveBalance?: LeaveBalance;
  colleagues?: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("wfh");
  const [leaveCategory, setLeaveCategory] = useState<LeaveCategory>("annual");
  const [hours, setHours] = useState<number | "">("");
  const [isPending, startTransition] = useTransition();
  const [helperId, setHelperId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const totalDays = calculateTotalDays();

  const getValidationError = (): string | null => {
    if (!leaveBalance) return null;

    if (requestType === "timeoff") {
      const requestedHours = Number(hours) || 0;
      if (requestedHours > leaveBalance.monthlyRemainingHours) {
        return `Requested hours (${requestedHours}h) exceed your remaining monthly balance (${leaveBalance.monthlyRemainingHours}h available).`;
      }
    }

    if (requestType === "dayoff" && totalDays > 0) {
      if (
        leaveCategory === "annual" &&
        totalDays > leaveBalance.annualRemaining
      ) {
        return `Requested duration (${totalDays} days) exceeds remaining Annual Leave (${leaveBalance.annualRemaining} days available).`;
      }

      if (leaveCategory === "sick" && totalDays > leaveBalance.sickRemaining) {
        return `Requested duration (${totalDays} days) exceeds remaining Sick Leave (${leaveBalance.sickRemaining} days available).`;
      }
    }

    return null;
  };

  const validationError = getValidationError();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validationError) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("type", requestType);

    if (requestType === "dayoff") {
      formData.append("totalDays", totalDays.toString());
      formData.append("leaveCategory", leaveCategory);
    }

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
        New Request
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Submit Request
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) =>
                    setRequestType(e.target.value as RequestType)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 cursor-pointer bg-white"
                >
                  <option value="wfh">Work From Home (WFH)</option>
                  <option value="dayoff">Full Day Off</option>
                  <option value="timeoff">Time-Off (Hourly)</option>
                  <option value="exchange">Shift / Day Exchange</option>
                </select>
              </div>

              {requestType === "dayoff" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Leave Category
                    </label>
                    <select
                      value={leaveCategory}
                      onChange={(e) =>
                        setLeaveCategory(e.target.value as LeaveCategory)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 cursor-pointer bg-white"
                    >
                      <option value="annual">
                        Annual Leave ({leaveBalance?.annualRemaining ?? 0} days
                        remaining)
                      </option>
                      <option value="sick">
                        Sick Leave ({leaveBalance?.sickRemaining ?? 0} days
                        remaining)
                      </option>
                      <option value="unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  {/* Date Range Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  {startDate && endDate && totalDays > 0 && (
                    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex justify-between items-center text-xs">
                      <span className="text-indigo-900 font-medium">
                        Total Days Requested
                      </span>
                      <span className="font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                        {totalDays} {totalDays === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                  )}
                </>
              )}

              {requestType === "exchange" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Select Helper / Coworker
                    </label>
                    <select
                      name="helperId"
                      value={helperId}
                      onChange={(e) => setHelperId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                    >
                      <option value="" disabled>
                        Select a coworker...
                      </option>
                      {colleagues.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Original Day Off / Shift Date
                    </label>
                    <input
                      type="date"
                      name="originalDate"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Target Exchange Date
                    </label>
                    <input
                      type="date"
                      name="exchangeDate"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                    />
                  </div>
                </>
              )}

              {requestType === "timeoff" && (
                <>
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">
                        Hours Requested
                      </label>
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        {leaveBalance?.monthlyRemainingHours ?? 0} hrs available
                        this month
                      </span>
                    </div>
                    <input
                      type="number"
                      name="hours"
                      min="1"
                      max="8"
                      value={hours}
                      onChange={(e) =>
                        setHours(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      required
                      placeholder="e.g. 2"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600"
                    />
                  </div>
                </>
              )}

              {requestType === "wfh" && (
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
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Reason / Notes
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  placeholder="Provide brief details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-600 resize-none"
                />
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {validationError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || Boolean(validationError)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
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

export interface PendingExchangeRequest {
  id: string;
  original_date: string | Date;
  exchange_date: string | Date;
  reason: string;
  requester_name: string;
}

export function PendingExchangesWidget({
  requests,
}: {
  requests: PendingExchangeRequest[];
}) {
  const [isPending, startTransition] = useTransition();

  if (!requests || requests.length === 0) return null;

  const handleResponse = (id: string, status: "Accepted" | "Rejected") => {
    startTransition(async () => {
      const res = await respondToExchangeRequest(id, status);
      if (!res.success) alert(res.error);
    });
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs text-left space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Shift Swap Requests
      </h3>

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-3 bg-white border border-amber-100 rounded-xl shadow-xs space-y-3"
          >
            <p className="text-xs text-slate-800">
              <span className="font-bold">{req.requester_name}</span> wants to
              swap shifts with you.
            </p>

            <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 space-y-1">
              <p>
                <strong>Their Shift:</strong>{" "}
                {new Date(req.original_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p>
                <strong>Your Shift:</strong>{" "}
                {new Date(req.exchange_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {req.reason && (
                <p className="italic text-slate-500 mt-1 border-t border-amber-100 pt-1">
                  &quot;{req.reason}&quot;
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleResponse(req.id, "Rejected")}
                disabled={isPending}
                className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={() => handleResponse(req.id, "Accepted")}
                disabled={isPending}
                className="flex-1 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Accept Swap
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
