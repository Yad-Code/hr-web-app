// @/app/(admin)/dashboard/(overview)/attendance/_components/attendance-header-actions.tsx
"use client";

import { Download, Calendar as CalendarIcon } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DailyAttendanceRow } from "../types";

export function AttendanceHeaderActions({
  logs,
  targetDate, // Added to keep the picker synced with the page
}: {
  logs: DailyAttendanceRow[];
  targetDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Simple CSV Export Logic
  const handleExportCSV = () => {
    const headers = [
      "Employee",
      "Department",
      "Status",
      "Check In",
      "Check Out",
      "Hours",
    ];
    const csvContent = logs.map(
      (log) =>
        `${log.employeeName},${log.department},${log.status},${log.checkInTime || ""},${log.checkOutTime || ""},${log.workHours || ""}`,
    );

    const csv = [headers.join(","), ...csvContent].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `attendance_export_${targetDate}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Push new date to URL to trigger server re-render
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (newDate) {
      params.set("date", newDate);
    } else {
      params.delete("date");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Date Picker */}
      <div className="relative flex items-center">
        <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="date"
          value={targetDate} // Controlled by the server state
          onChange={handleDateChange}
          className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#009473]/50 transition appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full cursor-pointer"
        />
      </div>

      {/* Export Button */}
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-[#009473] hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>Export CSV</span>
      </button>
    </div>
  );
}
