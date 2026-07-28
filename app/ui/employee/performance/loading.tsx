// app/my-profile/performance/loading.tsx
export default function PerformanceLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-32 bg-slate-200 rounded-xl w-full" />
      
      {/* Tab Nav Skeleton */}
      <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-44 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}