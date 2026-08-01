import { Check, X } from "lucide-react";
import { LeaveRequestRow } from "../types";

export function LeaveRequestsList({
  requests,
}: {
  requests: LeaveRequestRow[];
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Pending Time-Off
        </h2>
        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {requests.length} New
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    request.imageUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  }
                  alt={request.employeeName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {request.employeeName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {request.leaveType} • {request.days} Days
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {request.startDate} - {request.endDate}
                </span>

                <div className="flex gap-1.5">
                  <button className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 bg-[#009473] text-white rounded-md hover:bg-emerald-700 transition">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-xs text-slate-400">
            No pending leave requests.
          </p>
        )}
      </div>
    </div>
  );
}
