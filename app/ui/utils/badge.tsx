// @/app/ui/utils/badges.tsx

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "paid" || s === "confirmed") 
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">{status}</span>;
  if (s === "processing" || s === "pending" || s === "scheduled") 
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">{status}</span>;
  if (s === "held" || s === "cancelled") 
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">{status}</span>;
  
  return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200 uppercase tracking-wider">{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toLowerCase();
  if (p === "high") 
    return <span className="bg-rose-50 text-rose-700 border-rose-200/80 text-xs px-2.5 py-1 rounded-full font-semibold border">{priority} Priority</span>;
  if (p === "medium") 
    return <span className="bg-amber-50 text-amber-700 border-amber-200/80 text-xs px-2.5 py-1 rounded-full font-semibold border">{priority} Priority</span>;
  
  return <span className="bg-slate-50 text-slate-700 border-slate-200 text-xs px-2.5 py-1 rounded-full font-semibold border">{priority} Priority</span>;
}