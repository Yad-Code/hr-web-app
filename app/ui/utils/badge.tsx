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

export function MeetingStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  
  if (s === "confirmed") return <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">{status}</span>;
  if (s === "completed") return <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">{status}</span>;
  if (s === "pending" || s === "scheduled") return <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">{status}</span>;
  if (s === "cancelled") return <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border bg-rose-50 text-rose-700 border-rose-200">{status}</span>;
  
  return <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border bg-slate-50 text-slate-700 border-slate-200">{status}</span>;
}

export function FeedbackTypeBadge({ type }: { type: string }) {
  const t = type?.toLowerCase();
  
  if (t === "positive") return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">{type}</span>;
  if (t === "recognition") return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-purple-100 text-purple-800 border-purple-200">{type}</span>;
  if (t === "constructive") return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-200">{type}</span>;
  
  return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">{type}</span>;
}

export function ReviewRatingBadge({ rating }: { rating: string | number }) {
  const numRating = typeof rating === "number" ? rating : parseFloat(rating);
  
  if (numRating >= 4.5 || rating === "Exceeds Expectations") {
    return <span className="px-3 py-1 font-semibold rounded-full text-xs border bg-emerald-100 text-emerald-800 border-emerald-200">Rating: {rating}</span>;
  }
  if (numRating >= 3.0 || rating === "Meets Expectations") {
    return <span className="px-3 py-1 font-semibold rounded-full text-xs border bg-blue-100 text-blue-800 border-blue-200">Rating: {rating}</span>;
  }
  
  return <span className="px-3 py-1 font-semibold rounded-full text-xs border bg-amber-100 text-amber-800 border-amber-200">Rating: {rating}</span>;
}