// @/app/(admin)/dashboard/(overview)/performance/error.tsx
"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function PerformanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if you have one
    console.error("Performance Module Error:", error);
  }, [error]);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-100 text-center space-y-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Something went wrong loading performance data.
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          We encountered an issue fetching the latest reviews and goals. Please
          try again.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
      >
        Try Again
      </button>
    </div>
  );
}
