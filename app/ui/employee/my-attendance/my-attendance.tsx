"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  MapPin,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

// Import clean types from definitions
import {
  TodayAttendance,
  AttendanceSummary,
  LeaveBalance,
  CalendarDay,
  AttendanceLog,
} from "@/app/lib/employeeDashboard/attendance/definitions";

import {
  toggleCheckInStatus,
  submitWFHRequest,
} from "@/app/lib/employeeDashboard/employee/actions";

// ----------------------------------------------------------------------
// 1. Section Header
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// 2. Today's Status Card
// ----------------------------------------------------------------------

export function TodayStatusCard({ data }: { data?: TodayAttendance }) {
  const [isPending, startTransition] = useTransition();
  const [location, setLocation] = useState<"Office" | "Remote">("Office");

  const isCheckedIn = Boolean(data?.checkIn);
  const isCheckedOut = Boolean(data?.checkOut);

  // Fallback defaults if shift parameters aren't supplied by backend query
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
      {/* Header Bar */}
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
// ----------------------------------------------------------------------
// 3. Stats Grid
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// 4. Fixed Attendance Calendar Component
// ----------------------------------------------------------------------
interface AttendanceCalendarProps {
  currentMonth: string;
  currentYear: number;
  calendarDays?: (CalendarDay | number)[];
  /**
   * Array of day indexes considered working days.
   * Day indexes: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
   * Default below: [1, 2, 3, 4, 5] (Monday to Friday)
   * Change to [0, 1, 2, 3, 4] if working Sunday to Thursday.
   */
  workingDays?: number[];
}

export function AttendanceCalendar({
  currentMonth,
  currentYear,
  calendarDays = [],
  workingDays = [1, 2, 3, 4, 5], // Default: Mon - Fri
}: AttendanceCalendarProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // 1. Calculate current date metrics
  const monthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth();
  const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, monthIndex, 1).getDay();

  // 2. Calculate Previous / Next navigation targets
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? currentYear - 1 : currentYear;

  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? currentYear + 1 : currentYear;

  // 3. Normalize input data
  const normalizedDays: CalendarDay[] =
    calendarDays && calendarDays.length > 0
      ? calendarDays.map((d) => (typeof d === "number" ? { date: d } : d))
      : Array.from({ length: daysInMonth }, (_, i) => ({ date: i + 1 }));

  // 4. Add leading padding slots
  const hasLeadingPadding =
    normalizedDays.length > 0 && normalizedDays[0].date === null;
  const paddedDays: CalendarDay[] = hasLeadingPadding
    ? normalizedDays
    : [
        ...Array.from({ length: startDayOfWeek }, () => ({ date: null })),
        ...normalizedDays,
      ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-left h-full">
      {/* Calendar Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Title & Navigation */}
        <div className="flex items-center gap-4">
          {/* Fixed width to prevent jumping when month names change length */}
          <h3 className="text-sm font-bold text-slate-900 w-28">
            {currentMonth} {currentYear}
          </h3>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <Link
              href={`?month=${monthNames[prevMonthIndex]}&year=${prevYear}`}
              className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="w-[1px] h-4 bg-slate-200 mx-0.5" /> {/* Divider */}
            <Link
              href={`?month=${monthNames[nextMonthIndex]}&year=${nextYear}`}
              className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500 hover:text-slate-900"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Visual Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span>Work Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Off Day / Weekend</span>
          </div>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day, idx) => {
          const isWorkHeader = workingDays.includes(idx);
          return (
            <span
              key={day}
              className={`text-[10px] font-bold uppercase ${
                isWorkHeader ? "text-slate-700" : "text-slate-300"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {paddedDays.map((item, idx) => {
          const dayNum = item?.date;

          // Padding Cell
          if (dayNum === null || dayNum === undefined) {
            return (
              <div
                key={`pad-${idx}`}
                className="min-h-13 bg-slate-50/30 rounded-xl border border-dashed border-slate-100"
              />
            );
          }

          // Calculate Day of Week for this specific day
          const dateObj = new Date(currentYear, monthIndex, dayNum);
          const dayOfWeek = dateObj.getDay();
          const isWorkingDay = workingDays.includes(dayOfWeek);

          const status = item.status?.toLowerCase();

          // 1. NON-WORKING DAY / WEEKEND STYLING
          if (!isWorkingDay) {
            return (
              <div
                key={`day-${dayNum}-${idx}`}
                className="p-2 rounded-xl text-center border text-xs min-h-13 flex flex-col items-center justify-between bg-slate-100/60 border-slate-200/50 text-slate-400 opacity-60"
              >
                <span className="font-bold text-[11px]">{dayNum}</span>
                <span className="text-[9px] font-medium uppercase tracking-tight">
                  Off
                </span>
              </div>
            );
          }

          // 2. WORKING DAY STYLING (Based on status)
          return (
            <div
              key={`day-${dayNum}-${idx}`}
              className={`p-2 rounded-xl text-center border text-xs min-h-13 flex flex-col items-center justify-between transition-all ${
                status === "present"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold"
                  : status === "late"
                    ? "bg-amber-50 border-amber-200 text-amber-900 font-semibold"
                    : status === "absent"
                      ? "bg-rose-50 border-rose-200 text-rose-900 font-semibold"
                      : "bg-white border-slate-300 text-slate-800 shadow-2xs hover:border-indigo-400" // Default Working Day
              }`}
            >
              <span className="font-bold text-[11px] text-slate-900">
                {dayNum}
              </span>

              {item.status ? (
                <span className="text-[9px] font-bold tracking-tight opacity-90 capitalize">
                  {item.status}
                </span>
              ) : (
                <span className="text-[9px] font-medium text-slate-400">
                  Scheduled
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. Shift Summary Card
// ----------------------------------------------------------------------
export function ShiftSummaryCard({ data }: { data?: TodayAttendance }) {
  // Assuming your TodayAttendance definition includes shift details,
  // or you pass a separate Shift profile object.
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

// ----------------------------------------------------------------------
// 6. Leave Balance Card
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// 6. Leave Balance Card
// ----------------------------------------------------------------------
export function LeaveBalanceCard({
  leaveBalance,
}: {
  leaveBalance: LeaveBalance;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Leave Balances</h3>
      <div className="space-y-3 text-xs">
        {/* Monthly Time-Off Hours */}
        <div className="flex justify-between items-center p-2 bg-indigo-50/50 rounded-lg border border-indigo-50">
          <span className="text-indigo-900 font-medium">Monthly Time-Off</span>
          <span className="font-bold text-indigo-700">
            {leaveBalance.monthlyRemainingHours} /{" "}
            {leaveBalance.monthlyTotalHours} hrs
          </span>
        </div>

        {/* Existing Annual and Sick Leaves */}
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

// ----------------------------------------------------------------------
// 7. Attendance Log Table
// ----------------------------------------------------------------------
export function AttendanceLogTable({
  logs,
}: {
  logs: AttendanceLog[];
  month?: string;
  year?: number;
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
                <td className="px-4 py-3 font-medium text-slate-900">
                  {log.date}
                </td>
                <td className="px-4 py-3">{log.checkIn || "--:--"}</td>
                <td className="px-4 py-3">{log.checkOut || "--:--"}</td>
                <td className="px-4 py-3">{log.workHours || "--"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      log.status === "Present"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}
                  >
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

// ----------------------------------------------------------------------
// 8. Unified Absence & Shift Request Modal (With Balance Validation)
// ----------------------------------------------------------------------
type RequestType = "wfh" | "timeoff" | "dayoff" | "exchange";
type LeaveCategory = "annual" | "sick" | "unpaid";

export function AbsenceRequestModal({
      leaveBalance,
    }: {
      leaveBalance?: LeaveBalance;
    }) {
    const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("wfh");
  const [leaveCategory, setLeaveCategory] = useState<LeaveCategory>("annual");
  const [hours, setHours] = useState<number | "">("");
  const [isPending, startTransition] = useTransition();

  // Date states for calculating full day off duration
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Calculate inclusive number of days between start & end dates
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const totalDays = calculateTotalDays();

  // --------------------------------------------------------------------
  // Dynamic Balance Validation Helper
  // --------------------------------------------------------------------
  const getValidationError = (): string | null => {
    if (!leaveBalance) return null;

    // 1. Check Monthly Hourly Time-Off
    if (requestType === "timeoff") {
      const requestedHours = Number(hours) || 0;
      if (requestedHours > leaveBalance.monthlyRemainingHours) {
        return `Requested hours (${requestedHours}h) exceed your remaining monthly balance (${leaveBalance.monthlyRemainingHours}h available).`;
      }
    }

    // 2. Check Day Off Balances (Annual / Sick)
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

    // Prevent submission if balance is exceeded
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

              {/* ------------------------------------------------------------- */}
              {/* FULL DAY OFF                                                  */}
              {/* ------------------------------------------------------------- */}
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

              {/* ------------------------------------------------------------- */}
              {/* SHIFT EXCHANGE                                                */}
              {/* ------------------------------------------------------------- */}
              {requestType === "exchange" && (
                <>
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

              {/* ------------------------------------------------------------- */}
              {/* HOURLY TIME-OFF                                               */}
              {/* ------------------------------------------------------------- */}
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

              {/* ------------------------------------------------------------- */}
              {/* WFH                                                           */}
              {/* ------------------------------------------------------------- */}
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

              {/* Shared Field: Reason */}
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

              {/* Validation Warning Alert */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {validationError}
                </div>
              )}

              {/* Actions */}
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
