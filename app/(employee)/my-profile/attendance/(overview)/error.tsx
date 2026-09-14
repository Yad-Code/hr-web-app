"use client";

import { AlertCircle } from "lucide-react";

export default function AttendanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center bg-rose-50 rounded-2xl border border-rose-100 mt-6 max-w-7xl mx-auto">
      <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
      <h2 className="text-lg font-bold text-slate-900 mb-2">
        Something went wrong!
      </h2>
      <p className="text-sm text-slate-600 mb-6 max-w-md">
        {error.message || "We couldn't load your attendance data."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-rose-600 text-white font-bold text-sm rounded-lg hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
