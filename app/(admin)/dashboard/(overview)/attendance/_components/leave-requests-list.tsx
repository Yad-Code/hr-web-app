"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { LeaveRequestRow } from "../types";
import { updateLeaveRequestStatus } from "../_actions/leave-actions";
import Image from "next/image";

export function LeaveRequestsList({
  requests,
}: {
  requests: LeaveRequestRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusUpdate = (id: string, status: "Approved" | "Rejected") => {
    setProcessingId(id);

    startTransition(async () => {
      const result = await updateLeaveRequestStatus(id, status);

      if (!result.success) {
        // If you are using Sonner or react-hot-toast, trigger it here.
        alert(result.error);
      }

      setProcessingId(null);
    });
  };

  // Filter to ensure we only show pending requests in this queue
  const pendingRequests = requests.filter((req) => req.status === "Pending");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Pending Time-Off
        </h2>
        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {pendingRequests.length} New
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => {
            const isCurrentlyProcessing =
              isPending && processingId === request.id;

            return (
              <div key={request.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      request.imageUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    }
                    alt={request.employeeName}
                    width={36}
                    height={36}
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
                    {new Date(request.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" - "}
                    {new Date(request.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex gap-1.5">
                    {/* Reject Button */}
                    <button
                      onClick={() => handleStatusUpdate(request.id, "Rejected")}
                      disabled={isPending}
                      className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center"
                    >
                      {isCurrentlyProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Approve Button */}
                    <button
                      onClick={() => handleStatusUpdate(request.id, "Approved")}
                      disabled={isPending}
                      className="p-1.5 bg-[#009473] text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center"
                    >
                      {isCurrentlyProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-6 text-center text-xs text-slate-400">
            No pending leave requests.
          </p>
        )}
      </div>
    </div>
  );
}
