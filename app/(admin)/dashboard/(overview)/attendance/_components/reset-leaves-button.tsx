"use client";

import { useState, useTransition } from "react";
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { resetAllLeaveBalances } from "@/app/lib/admin/performance/actions";

export function ResetLeavesButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetAllLeaveBalances();
      alert(result.message);
      setIsConfirming(false);
    });
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 p-1 bg-rose-50 border border-rose-100 rounded-xl animate-fadeIn">
        <span className="px-2 text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Reset company balances?
        </span>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Yes, Reset"
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors shadow-xs cursor-pointer"
    >
      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
      Reset Annual Leaves
    </button>
  );
}
