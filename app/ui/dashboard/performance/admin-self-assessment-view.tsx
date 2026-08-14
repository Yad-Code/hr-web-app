// app/ui/admin/performance/admin-self-assessment-view.tsx
import { SelfAssessment } from "@/app/lib/employeeDashboard/performance/definitions";
import { formatDate } from "@/app/lib/utils";

export default function AdminSelfAssessmentView({
  assessment,
  employeeName,
}: {
  assessment: SelfAssessment | null;
  employeeName: string;
}) {
  // 1. Handle Missing Assessment
  if (!assessment) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-slate-500 text-sm">
          No self-assessment has been initiated for this cycle.
        </p>
      </div>
    );
  }
 
  if (!assessment.submitted) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <p className="text-amber-800 font-medium text-sm">
            {employeeName} is currently drafting their self-assessment.
          </p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
        <div>
          <h3 className="text-blue-800 font-bold">
            Assessment Submitted by {employeeName}
          </h3>
          <p className="text-blue-700 text-xs mt-1">
            Cycle: <span className="font-semibold">{assessment.cycle}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-blue-700 text-sm font-medium">
            {formatDate(assessment.submitted_at)}
          </p>
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">
            Achievements
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg">
            {assessment.achievements}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">
            Challenges
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg">
            {assessment.challenges}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">
            Future Goals
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg">
            {assessment.future_goals}
          </p>
        </div>
      </div>
    </div>
  );
}