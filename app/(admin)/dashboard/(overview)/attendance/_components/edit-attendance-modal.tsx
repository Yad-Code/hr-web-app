"use client";

import { useState, useTransition } from "react";
import { Clock, X, Loader2, Save } from "lucide-react";
import { DailyAttendanceRow } from "../types";
import { overrideAttendanceRecord } from "../_actions/attendance-actions";

interface EditAttendanceModalProps {
  record: DailyAttendanceRow;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAttendanceModal({ record, isOpen, onClose }: EditAttendanceModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.append("recordId", record.id);

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
            Override Attendance: {record.employeeName}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select 
              name="status" 
              defaultValue={record.status}
              className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#009473]"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check In Time</label>
              <input 
                type="text" 
                name="checkInTime" 
                defaultValue={record.checkInTime || ""}
                placeholder="e.g. 09:00 AM"
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check Out Time</label>
              <input 
                type="text" 
                name="checkOutTime" 
                defaultValue={record.checkOutTime || ""}
                placeholder="e.g. 05:00 PM"
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
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
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}