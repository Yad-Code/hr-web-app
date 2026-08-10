import { Award, CheckCircle2, Target, UserCheck } from "lucide-react";
import { PerformanceKpiData } from "../types";

export function PerformanceKpiCards({ stats }: { stats: PerformanceKpiData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Avg Rating */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-[#009473] rounded-xl">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg. Performance Rating
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {stats.avgRating} / 5.0
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {stats.currentQuarter}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Completed */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Reviews Completed
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {stats.completedReviews}
            </span>
            <span className="text-xs text-slate-400">
              ({stats.pendingReviews} pending)
            </span>
          </div>
        </div>
      </div>

      {/* Active Objectives */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Objectives
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {stats.activeGoals} Goals
            </span>
          </div>
        </div>
      </div>

      {/* Self Assessments */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Self Assessments
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {stats.submittedAssessments}
            </span>
            <span className="text-xs text-slate-400">Submitted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
