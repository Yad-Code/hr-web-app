// app/ui/employee/performance/performance-header.tsx
import { PerformanceProfile } from "@/app/lib/employeeDashboard/performance/definitions";
import { formatDate } from "@/app/lib/utils";

export default function PerformanceHeader({
  profile,
}: {
  profile: PerformanceProfile | null;
}) {
  if (!profile) {
    return (
      <div className="bg-linear-to-r from-slate-600 to-slate-800 text-white p-6 rounded-xl shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-slate-500/50 px-3 py-1 rounded-full border border-slate-400/30">
            New Employee
          </span>
          <h1 className="text-2xl font-bold mt-2">Performance Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1">
            Status:{" "}
            <span className="font-semibold text-white">
              Pending Evaluation Cycle
            </span>
          </p>
        </div>

        <div className="flex gap-4 sm:gap-6 text-center opacity-75">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10">
            <p className="text-xs text-slate-300">Overall Rating</p>
            <p className="text-2xl font-bold mt-1">N/A</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10">
            <p className="text-xs text-slate-300">Next Review</p>
            <p className="text-2xl font-bold mt-1">TBD</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-md flex flex-wrap justify-between items-center gap-4">
      {/* ... your existing return block stays exactly the same ... */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider bg-blue-500/30 px-3 py-1 rounded-full border border-blue-400/30">
          {profile.cycle}
        </span>
        <h1 className="text-2xl font-bold mt-2">Performance Dashboard</h1>
        <p className="text-blue-100 text-sm mt-1">
          Status:{" "}
          <span className="font-semibold text-white">{profile.status}</span>
        </p>
      </div>

      <div className="flex gap-4 sm:gap-6 text-center">
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10">
          <p className="text-xs text-blue-200">Overall Rating</p>
          <p className="text-2xl font-bold mt-1">{profile.rating} / 5.0</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10">
          <p className="text-xs text-blue-200">Next Review</p>
          <p className="text-2xl font-bold mt-1">
            {formatDate(profile.next_review)}
          </p>
        </div>
      </div>
    </div>
  );
}
