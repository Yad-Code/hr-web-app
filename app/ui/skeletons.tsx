// 1. Individual Stat Card Skeleton
export function CardSkeleton() {
  return (
    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-slate-200 rounded-md" />
        <div className="h-5 w-5 bg-slate-100 rounded-full" />
      </div>
      <div className="h-8 w-16 bg-slate-300 rounded-lg" />
      <div className="h-3 w-32 bg-slate-100 rounded-md" />
    </div>
  );
}

// 2. Cards Grid Wrapper Skeleton
export function CardsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

// 3. Page Header Skeleton
export function DashboardHeaderSkeleton() {
  return (
    <div className="border-b border-slate-100 pb-5 text-left">
      <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2" />
      <div className="h-4 w-72 bg-slate-100 rounded-md" />
    </div>
  );
}

// 4. Main Chart / Calendar Block Skeleton
export function RetentionEngagementChartSkeleton() {
  return (
    <div className="xl:col-span-2 w-full flex flex-col">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col space-y-6 min-h-105">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-slate-200 rounded-md" />
          <div className="h-3 w-64 bg-slate-100 rounded-md" />
        </div>
        <div className="grow w-full bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between min-h-70">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-2 bg-slate-200/60 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Right Sidebar Widget Skeleton
export function EmployeeActivitySkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center min-h-105 space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-50 shadow-sm" />
      <div className="h-4 w-32 bg-slate-200 rounded-md" />
      <div className="h-3 w-40 bg-slate-100 rounded-md" />
      <div className="h-3 w-28 bg-slate-100 rounded-md" />
    </div>
  );
}

// 6. The Master Dashboard Skeleton (Combines them all)
export function DashboardSkeleton() {
  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      <DashboardHeaderSkeleton />
      <CardsGridSkeleton />
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3 items-start">
        <RetentionEngagementChartSkeleton />
        <EmployeeActivitySkeleton />
      </div>
    </main>
  );
}
