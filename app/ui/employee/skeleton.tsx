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
              <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
              
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


// 1. Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-24 sm:h-32 w-full bg-slate-200" />

      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar Skeleton */}
        <div className="absolute -top-12 left-6">
          <div className="w-24 h-24 rounded-full bg-slate-300 border-4 border-white shadow-md" />
        </div>

        {/* Info & Button Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-14">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* Name */}
              <div className="h-7 w-48 bg-slate-200 rounded-md" />
              {/* Role Tag */}
              <div className="h-5 w-16 bg-slate-200 rounded" />
              {/* Status Tag */}
              <div className="h-5 w-14 bg-slate-200 rounded" />
            </div>
            {/* Subtitle */}
            <div className="h-4 w-64 bg-slate-200 rounded-md" />
          </div>

          {/* Sign Out Button Placeholder */}
          <div className="h-8 w-28 bg-slate-200 rounded-xl self-start md:self-auto" />
        </div>
      </div>
    </div>
  );
}

// 2. Official Info Card Skeleton
export function OfficialInfoCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>

      {/* Rows */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-slate-200 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Profile Form Skeleton
export function ProfileFormSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-slate-200 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-24 bg-slate-200 rounded" />
              <div className="h-9 w-full bg-slate-100 rounded-lg border border-slate-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="h-10 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

// 4. Combined Profile Page Skeleton (matches your full grid layout)
export function FullProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left">
      <ProfileHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfficialInfoCardSkeleton />
        <ProfileFormSkeleton />
      </div>
    </div>
  );
}