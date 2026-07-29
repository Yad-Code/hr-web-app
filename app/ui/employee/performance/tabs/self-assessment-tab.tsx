// app/ui/employee/performance/tabs/self-assessment-tab.tsx
"use client";

import { useTransition, useState } from "react";
import { SelfAssessment } from "@/app/lib/employeeDashboard/performance/definitions";
import {
  submitSelfAssessment,
  reopenSelfAssessment,
  saveSelfAssessmentDraft,
} from "@/app/lib/employeeDashboard/performance/actions/selfAssessment";
import { formatDate } from "@/app/lib/utils";

export default function SelfAssessmentTab({
  assessment,
}: {
  assessment: SelfAssessment | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Track text for live character counts
  const [achievements, setAchievements] = useState(
    assessment?.achievements || "",
  );
  const [challenges, setChallenges] = useState(assessment?.challenges || "");
  const [futureGoals, setFutureGoals] = useState(
    assessment?.future_goals || "",
  );

  const MAX_CHARS = 1000; // Adjust this limit based on your preferences

  const handleReopen = () => {
    startTransition(async () => {
      setError(null);
      await reopenSelfAssessment();
      setSuccessMsg(null);
    });
  };

  const handleDraft = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const result = await saveSelfAssessmentDraft(formData);
      if (!result.success) {
        setError("Failed to save draft. Please try again.");
      } else {
        setSuccessMsg("Draft saved successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const result = await submitSelfAssessment(formData);
      if (!result.success) {
        setError("Failed to submit. Please check the fields.");
      }
    });
  };

  if (!assessment)
    return <p className="text-slate-500">No active self-assessment cycle.</p>;

  // READ-ONLY VIEW
  if (assessment.submitted) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex justify-between items-center">
          <div>
            <h3 className="text-green-800 font-semibold">
              Assessment Submitted
            </h3>
            <p className="text-green-700 text-sm">
              Submitted on {formatDate(assessment.submitted_at)}
            </p>
          </div>
          <button
            onClick={handleReopen}
            disabled={isPending}
            className="px-4 py-2 bg-white border border-green-300 rounded text-green-700 hover:bg-green-100 text-sm font-medium transition-colors"
          >
            {isPending ? "Reopening..." : "Reopen Assessment"}
          </button>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2">
              Achievements
            </h4>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {assessment.achievements}
            </p>
          </div>
          <hr className="border-slate-100" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2">
              Challenges
            </h4>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {assessment.challenges}
            </p>
          </div>
          <hr className="border-slate-100" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2">
              Future Goals
            </h4>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {assessment.future_goals}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // EDIT VIEW
  return (
    <form className="space-y-6 max-w-3xl">
      {/* Hidden input to pass the cycle to Server Actions */}
      <input type="hidden" name="cycle" value={assessment.cycle} />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">
          Self Assessment - {assessment.cycle}
        </h2>
        {successMsg && (
          <span className="text-sm font-medium text-green-600">
            {successMsg}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* ACHIEVEMENTS */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Achievements
            </label>
            <p className="text-xs text-slate-500">
              What were your major wins and contributions this cycle?
            </p>
          </div>
          <span
            className={`text-xs ${achievements.length > MAX_CHARS ? "text-red-500 font-bold" : "text-slate-400"}`}
          >
            {achievements.length} / {MAX_CHARS}
          </span>
        </div>
        <textarea
          name="achievements"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          required
          maxLength={MAX_CHARS}
          rows={4}
          className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* CHALLENGES */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Challenges
            </label>
            <p className="text-xs text-slate-500">
              What obstacles did you face and how did you overcome them?
            </p>
          </div>
          <span
            className={`text-xs ${challenges.length > MAX_CHARS ? "text-red-500 font-bold" : "text-slate-400"}`}
          >
            {challenges.length} / {MAX_CHARS}
          </span>
        </div>
        <textarea
          name="challenges"
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          required
          maxLength={MAX_CHARS}
          rows={4}
          className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* FUTURE GOALS */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Future Goals
            </label>
            <p className="text-xs text-slate-500">
              What do you want to focus on for the next review cycle?
            </p>
          </div>
          <span
            className={`text-xs ${futureGoals.length > MAX_CHARS ? "text-red-500 font-bold" : "text-slate-400"}`}
          >
            {futureGoals.length} / {MAX_CHARS}
          </span>
        </div>
        <textarea
          name="future_goals"
          value={futureGoals}
          onChange={(e) => setFutureGoals(e.target.value)}
          required
          maxLength={MAX_CHARS}
          rows={4}
          className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          formAction={handleDraft}
          disabled={isPending}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="submit"
          formAction={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Submit Assessment
        </button>
      </div>
    </form>
  );
}
