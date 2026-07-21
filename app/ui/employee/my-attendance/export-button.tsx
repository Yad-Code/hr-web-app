"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  logs?: Array<{ date: string; checkIn: string; checkOut: string; status: string }>;
}

export function ExportButton({ logs = [] }: ExportButtonProps) {
  const handleExport = () => {
    if (logs.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = ["Date", "Check In", "Check Out", "Status"];
    const rows = logs.map((log) => [
      log.date,
      log.checkIn || "N/A",
      log.checkOut || "N/A",
      log.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs active:scale-95 cursor-pointer"
    >
      <Download className="w-4 h-4 text-slate-500" />
      <span>Export Report</span>
    </button>
  );
}