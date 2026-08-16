"use client";

import { useState } from "react";
import { Search, Filter, Edit2 } from "lucide-react";
import { DailyAttendanceRow } from "../types";
import { EditAttendanceModal } from "./edit-attendance-modal";
import Image from "next/image";

export function DailyAttendanceTable({ logs }: { logs: DailyAttendanceRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingRecord, setEditingRecord] = useState<DailyAttendanceRow | null>(
    null,
  );

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyles = (status: DailyAttendanceRow["status"]) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
      case "Late":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      case "Absent":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50";
      case "On Leave":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Activity Log & Overrides
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#009473]"
              />
            </div>

            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-8 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Check In</th>
                <th className="px-4 py-3 font-semibold">Check Out</th>
                <th className="px-4 py-3 font-semibold">Hours</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Image
                      src={
                        log.imageUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      }
                      alt={log.employeeName}
                      width={36}
                      height={36}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {log.employeeName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {log.department}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusStyles(log.status)}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {log.checkInTime || "--:--"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {log.checkOutTime || "--:--"}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-900 dark:text-slate-100">
                    {log.workHours || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingRecord(log)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#009473] hover:text-white rounded-md transition"
                      title="Override Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingRecord && (
        <EditAttendanceModal
          record={editingRecord}
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </>
  );
}
