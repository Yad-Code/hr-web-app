// @/app/(admin)/dashboard/(overview)/attendance/_components/edit-attendance-modal.tsx
"use client";

import { useState, useTransition } from "react";
import { Clock, X, Loader2, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { DailyAttendanceRow } from "../types";
import { overrideAttendanceRecord } from "../_actions/attendance-actions";

interface EditAttendanceModalProps {
  record: DailyAttendanceRow;
  isOpen: boolean;
  onClose: () => void;
}

function convertTo24Hour(timeStr: string | null): string {
  if (!timeStr) return "";
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3].toUpperCase();

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

export function EditAttendanceModal({
  record,
  isOpen,
  onClose,
}: EditAttendanceModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Grab the active date from the URL (or default to today)
  const searchParams = useSearchParams();
  const targetDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.append("recordId", record.id);
    data.append("targetDate", targetDate); // Pass date to backend for missing records

    startTransition(async () => {
      const res = await overrideAttendanceRecord(data);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "An error occurred");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#009473]" />
            Override: {record.employeeName}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={record.status}
              className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#009473]"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
              <option value="Off Day">Off Day</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Check In Time
              </label>
              <input
                type="time"
                name="checkInTime"
                defaultValue={convertTo24Hour(record.checkInTime)}
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Check Out Time
              </label>
              <input
                type="time"
                name="checkOutTime"
                defaultValue={convertTo24Hour(record.checkOutTime)}
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#009473] hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
