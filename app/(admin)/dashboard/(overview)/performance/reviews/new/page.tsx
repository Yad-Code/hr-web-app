// @/app/(admin)/dashboard/(overview)/performance/reviews/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createNewReview } from "@/app/lib/admin/performance/actions";
import { getEmployeesList } from "@/app/lib/admin/performance/data";
import { SubmitReviewButton } from "../../_components/submit-buttons";

export default async function NewReviewPage() {
  // 1. Fetches strictly scoped employees (Manager sees team, Admin sees all)
  const employees = await getEmployeesList();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/performance/reviews" className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create Performance Review</h1>
          <p className="text-xs text-slate-500 mt-1">Submit a formal performance evaluation for an employee.</p>
        </div>
      </div>

      <form action={createNewReview} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-semibold text-slate-900 block">Employee</label>
            <select id="userId" name="userId" required defaultValue="" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all">
              <option value="" disabled>Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="period" className="text-sm font-semibold text-slate-900 block">Review Period</label>
            <input type="text" id="period" name="period" placeholder="e.g., Q1-Q2 2026 or Annual 2026" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-semibold text-slate-900 block">Evaluation Date</label>
            <input type="date" id="date" name="date" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="reviewer" className="text-sm font-semibold text-slate-900 block">Reviewer Name</label>
              <input type="text" id="reviewer" name="reviewer" placeholder="Manager's Name" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="rating" className="text-sm font-semibold text-slate-900 block">Overall Rating (1-5)</label>
              <input type="number" id="rating" name="rating" min="1" max="5" step="0.1" placeholder="4.5" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
            </div>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Dashboard Analytics (1-100)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="productivity" className="text-sm font-semibold text-slate-900 block">Productivity Score</label>
              <input type="number" id="productivity" name="productivity" min="1" max="100" placeholder="85" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="quality" className="text-sm font-semibold text-slate-900 block">Quality of Work</label>
              <input type="number" id="quality" name="quality" min="1" max="100" placeholder="90" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="teamwork" className="text-sm font-semibold text-slate-900 block">Teamwork & Culture</label>
              <input type="number" id="teamwork" name="teamwork" min="1" max="100" placeholder="95" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
            </div>
          </div>
        </div> 

        <hr className="border-slate-100" />

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="strengths" className="text-sm font-semibold text-slate-900 block">Key Strengths</label>
            <textarea id="strengths" name="strengths" rows={3} placeholder="Detail the employee's top contributions and strengths..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y" />
          </div>
          <div className="space-y-2">
            <label htmlFor="improvements" className="text-sm font-semibold text-slate-900 block">Areas for Improvement</label>
            <textarea id="improvements" name="improvements" rows={3} placeholder="What skills or behaviors could be developed further?" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="managerComments" className="text-sm font-semibold text-slate-900 block">Managers Final Comments</label>
              <textarea id="managerComments" name="managerComments" rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y" />
            </div>
            <div className="space-y-2">
              <label htmlFor="employeeComments" className="text-sm font-semibold text-slate-900 block">Employees Comments (Optional)</label>
              <textarea id="employeeComments" name="employeeComments" rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="goalsForNextCycle" className="text-sm font-semibold text-slate-900 block">Goals for Next Cycle</label>
            <textarea id="goalsForNextCycle" name="goalsForNextCycle" rows={3} placeholder="Define 1-3 primary objectives for the next review period..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link href="/dashboard/performance/reviews" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            Cancel
          </Link>
          <SubmitReviewButton />
        </div>
      </form>
    </div>
  );
}