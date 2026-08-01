import { DailyAttendanceRow } from "../types";

export function DailyAttendanceTable({ logs }: { logs: DailyAttendanceRow[] }) {
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Todays Activity Log
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Check In</th>
              <th className="px-4 py-3 font-semibold">Check Out</th>
              <th className="px-4 py-3 font-semibold text-right">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
              >
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={
                      log.imageUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    }
                    alt={log.employeeName}
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
                <td className="px-4 py-3 text-xs font-medium text-slate-900 dark:text-slate-100 text-right">
                  {log.workHours || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
