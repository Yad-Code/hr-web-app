"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/app/lib/employeeDashboard/employee/actions";

interface RequestItemProps {
  request: {
    id: string;
    type: string;
    description: string;
    status: string;
    created_at: Date;
    employee_name: string;
    job_title: string | null;
    employee_image: string | null;
  };
}

export function RequestItem({ request }: RequestItemProps) {
  const [isPending, startTransition] = useTransition();

  const typeLabels: Record<string, string> = {
    wfh: "🏠 WFH",
    dayoff: "🌴 Day Off",
    timeoff: "⏱️ Time Off",
    exchange: "🔄 Exchange",
  };

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveLeaveRequest(request.id);
      if (!res.success) {
        alert(res.error || "Failed to approve request");
      }
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      const res = await rejectLeaveRequest(request.id);
      if (!res.success) {
        alert(res.error || "Failed to decline request");
      }
    });
  };

  return (
    <div className="p-4 hover:bg-slate-50/70 transition-colors duration-150 flex flex-col space-y-2.5">
      {/* Top Meta Line: User Info and Type Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Image
            src={
              request.employee_image ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
            }
            alt={request.employee_name}
            width={36}
            height={36}
            className="w-7 h-7 rounded-full border border-slate-100 object-cover shadow-xs"
          />
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              {request.employee_name}
            </span>

            {request.status.toLowerCase() === "pending" &&
              request.job_title && (
                <span className="text-[10px] text-slate-500 font-medium block mb-0.5">
                  {request.job_title}
                </span>
              )}

            <span className="text-[10px] text-slate-400 font-medium">
              {formatDistanceToNow(new Date(request.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide uppercase">
          {typeLabels[request.type] || request.type}
        </span>
      </div>

      {/* Description Content Line */}
      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/60">
        <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-normal break-words">
          {request.description}
        </p>
      </div>

      {/* Action Controls Footer */}
      <div className="flex items-center justify-end space-x-2 pt-1">
        <button
          type="button"
          onClick={handleDecline}
          disabled={isPending}
          className="px-3 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs shadow-indigo-100 cursor-pointer disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          Approve
        </button>
      </div>
    </div>
  );
}
