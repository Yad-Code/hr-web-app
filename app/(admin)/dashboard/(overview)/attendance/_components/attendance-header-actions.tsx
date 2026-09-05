// @/app/(admin)/dashboard/(overview)/attendance/_components/attendance-header-actions.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Download,
  Calendar as CalendarIcon,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DailyAttendanceRow, ShiftRule } from "../types";
import { assignEmployeeShift } from "../_actions/attendance-actions";

export function AttendanceHeaderActions({
  logs,
  targetDate,
  employees = [],
  shifts = [],
}: {
  logs: DailyAttendanceRow[];
  targetDate: string;
  employees?: {
    id: string;
    name: string;
    department: string;
    shift_type: string;
  }[];
  shifts?: ShiftRule[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) params.set("date", e.target.value);
    else params.delete("date");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleAssignShift = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await assignEmployeeShift(formData);
      if (res.success) setIsModalOpen(false);
      else alert(res.error);
    });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="date"
            value={targetDate}
            onChange={handleDateChange}
            className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#009473]/50 cursor-pointer"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Clock className="w-4 h-4" />
          <span>Assign Shift</span>
        </button>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#009473] hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Assign Shift to Employee
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Employee
                </label>
                <select
                  name="employeeId"
                  required
                  defaultValue=""
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="" disabled>
                    Choose an employee...
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department}) - Current: {emp.shift_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select New Shift Rule
                </label>
                <select
                  name="shiftRuleId"
                  required
                  defaultValue=""
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="" disabled>
                    Choose a shift...
                  </option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.shiftName} ({shift.startTime} - {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Assignment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
