import Image from "next/image";
import { Check, X, Plane, Receipt } from "lucide-react";
import { PendingRequest } from "@/app/lib/data";

interface RequestItemProps {
  request: PendingRequest;
}

export function RequestItem({ request }: RequestItemProps) {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    request.employee_name
  )}&background=f1f5f9&color=64748b`;
  
  const isTimeOff = request.type === 'time-off';

  return (
    <div className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-3">
      {/* Avatar Container with overlapping type badge */}
      <div className="relative w-10 h-10 rounded-full flex-shrink-0 bg-slate-100">
        <Image
          src={request.image_url || fallbackAvatar}
          alt={request.employee_name}
          fill
          className="object-cover rounded-full"
          sizes="40px"
        />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
          isTimeOff ? 'bg-indigo-100' : 'bg-emerald-100'
        }`}>
          {isTimeOff ? (
            <Plane className="w-2.5 h-2.5 text-indigo-600" />
          ) : (
            <Receipt className="w-2.5 h-2.5 text-emerald-600" />
          )}
        </div>
      </div>

      {/* Request Info Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900 truncate">
            {request.employee_name}
          </p>
          <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
            {request.created_at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {request.description}
        </p>

        {/* Action Controls */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#eaf8f5] text-[#007a64] rounded-lg text-xs font-bold hover:bg-[#009473] hover:text-white transition-colors active:scale-95">
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button className="flex items-center justify-center py-1.5 px-3 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors active:scale-95">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}