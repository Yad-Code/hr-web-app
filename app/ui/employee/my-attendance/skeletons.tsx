// app/(dashboard)/attendance/skeletons.ts

export function TodayStatusSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
      <div className="h-4 w-28 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-7 w-16 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse h-64 space-y-4">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-44 bg-slate-100 rounded-xl" />
    </div>
  );
}

export function LogTableSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse space-y-3">
      <div className="h-4 w-36 bg-slate-200 rounded" />
      <div className="h-32 bg-slate-100 rounded-xl" />
    </div>
  );
}