// app/ui/employee/performance/tabs/self-assessment-tab.tsx
"use client";

import { useTransition } from "react";
import { SelfAssessment } from "@/app/lib/performance/definitions";
import { submitSelfAssessment, reopenSelfAssessment } from "@/app/lib/performance/actions/selfAssessment";

export default function SelfAssessmentTab({ assessment }: { assessment: SelfAssessment | null }) {
  const [isPending, startTransition] = useTransition();

  const handleReopen = () => {
    startTransition(async () => {
      await reopenSelfAssessment(); // Uses the server action[cite: 8]
    });
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await submitSelfAssessment(formData); // Uses the server action[cite: 8]
      if (!result.success) {
        alert("Failed to submit. Please check the fields.");
      }
    });
  };

  if (!assessment) return <p>No active self-assessment cycle.</p>;

  if (assessment.submitted) {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-green-800 font-semibold mb-2">Assessment Submitted!</h3>
        <p className="text-green-700 text-sm mb-4">You submitted your assessment on {String(assessment.submitted_at)}</p>
        <button 
          onClick={handleReopen} 
          disabled={isPending}
          className="px-4 py-2 bg-white border border-green-300 rounded text-green-700 hover:bg-green-100 text-sm"
        >
          Reopen Assessment
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-semibold">Self Assessment - {assessment.cycle}</h2>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Achievements (Min 10 chars)</label>
        <textarea 
          name="achievements" 
          defaultValue={assessment.achievements} 
          required 
          minLength={10}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Challenges (Min 10 chars)</label>
        <textarea 
          name="challenges" 
          defaultValue={assessment.challenges} 
          required 
          minLength={10}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Future Goals (Min 10 chars)</label>
        <textarea 
          name="future_goals" 
          defaultValue={assessment.future_goals} 
          required 
          minLength={10}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Assessment"}
      </button>
    </form>
  );
}