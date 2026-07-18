import { formatDistanceToNow } from "date-fns";

interface RequestItemProps {
  request: {
    id: string;
    type: string;
    description: string; // 👈 Add to your structural type definition
    status: string;
    created_at: Date;
    employee_name: string;
    employee_image: string | null;
  };
}

export function RequestItem({ request }: RequestItemProps) {
  // Simple type mapper for cleaner badges
  const typeLabels: Record<string, string> = {
    "time-off": "🌴 Time Off",
    "expense": "💰 Expense",
    "hardware": "💻 Hardware",
  };

  return (
    <div className="p-4 hover:bg-slate-50/70 transition-colors duration-150 flex flex-col space-y-2.5">
      {/* Top Meta Line: User Info and Type Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img
            src={request.employee_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"}
            alt={request.employee_name}
            className="w-7 h-7 rounded-full border border-slate-100 object-cover shadow-sm"
          />
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              {request.employee_name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide uppercase">
          {typeLabels[request.type] || request.type}
        </span>
      </div>

      {/* Description Content Line: Renders the full sentence perfectly */}
      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/60">
        <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-normal break-words">
          {request.description}
        </p>
      </div>

      {/* Action Controls Footer */}
      <div className="flex items-center justify-end space-x-2 pt-1">
        <button className="px-3 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-all shadow-sm">
          Decline
        </button>
        <button className="px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm shadow-indigo-100">
          Approve
        </button>
      </div>
    </div>
  );
}