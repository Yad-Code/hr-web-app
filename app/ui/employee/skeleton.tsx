export function EmployeeSearchListSkeleton() {
  // Array of 5 items to generate simulated rows
  const placeholderRows = Array.from({ length: 5 });

  return (
    <div className="w-full animate-pulse">
      {/* Header Panel Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-slate-200 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* Modern Search Input Container Skeleton */}
      <div className="h-10 w-full bg-slate-100 rounded-xl mb-6 border border-slate-100" />

      {/* List Container Skeleton */}
      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {placeholderRows.map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4">
            {/* Left Side: Avatar & Name lines */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Profile Circle */}
              <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
              
              {/* Info Blocks */}
              <div className="space-y-2 flex-1 max-w-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                  {index % 3 === 0 && (
                    <div className="h-3.5 w-10 bg-slate-100 rounded" />
                  )}
                </div>
                <div className="h-3 w-40 bg-slate-100 rounded-md" />
              </div>
            </div>

            {/* Right Side: Timestamp Anchor */}
            <div className="h-3 w-16 bg-slate-100 rounded-md shrink-0 ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
}