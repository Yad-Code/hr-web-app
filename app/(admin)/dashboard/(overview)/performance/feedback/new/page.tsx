// @/app/(admin)/dashboard/(overview)/performance/feedback/new/page.tsx
import { getEmployeesList } from "@/app/lib/admin/performance/data";
import { createNewFeedback } from "@/app/lib/admin/performance/actions";
import { SubmitButton } from "./submit-button";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default async function NewFeedbackPage() {
  // Secured automatically via the data layer
  const employees = await getEmployeesList();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/performance"
          className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Log New Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record positive recognition or constructive feedback for a team
            member.
          </p>
        </div>
      </div>

      <form
        action={createNewFeedback}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="userId"
            className="text-sm font-semibold text-slate-900 block"
          >
            Select Employee
          </label>
          <select
            id="userId"
            name="userId"
            required
            defaultValue=""
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
          >
            <option value="" disabled>
              Choose an employee...
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="type"
            className="text-sm font-semibold text-slate-900 block"
          >
            Feedback Type
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue="Positive"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
          >
            <option value="Positive">Positive</option>
            <option value="Recognition">Recognition</option>
            <option value="Constructive">Constructive</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="text"
            className="text-sm font-semibold text-slate-900 block"
          >
            Feedback Details
          </label>
          <textarea
            id="text"
            name="text"
            required
            rows={5}
            placeholder="Detail the feedback or recognition here..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            href="/dashboard/performance"
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
