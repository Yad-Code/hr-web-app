import React from "react";
import { History } from "lucide-react";

export interface HistoryItem {
  title: string;
  period: string;
}

export function EmploymentHistoryTimeline({
  history,
}: {
  history: HistoryItem[];
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <History className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Employment History Log
        </h2>
      </div>

      <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
        {history.map((item, index) => (
          <div key={index} className="relative group">
            <div className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {item.period}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
