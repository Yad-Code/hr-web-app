// @/app/(admin)/dashboard/(overview)/performance/reviews/new/page.tsx

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { createNewReview } from "@/app/lib/admin/performance/actions";
import { SubmitButton } from "./submit-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EmployeeRow {
  id: string;
  name: string;
  department: string;
}

export default async function NewReviewPage() {
  const employees = (await db`
    SELECT id, name, department 
    FROM users 
    WHERE status = 'Active' 
    ORDER BY name ASC
  `) as unknown as EmployeeRow[];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/performance/reviews"
          className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Create Performance Review
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit a formal performance evaluation for an employee.
          </p>
        </div>
      </div>

      <form
        action={createNewReview}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-8"
      >
        {/* --- Top Section: Metadata Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="userId"
              className="text-sm font-semibold text-slate-900 block"
            >
              Employee
            </label>
            <select
              id="userId"
              name="userId"
              required
              defaultValue=""
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            >
              <option value="" disabled>
                Select an employee...
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
              htmlFor="period"
              className="text-sm font-semibold text-slate-900 block"
            >
              Review Period
            </label>
            <input
              type="text"
              id="period"
              name="period"
              placeholder="e.g., Q1-Q2 2026 or Annual 2026"
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="date"
              className="text-sm font-semibold text-slate-900 block"
            >
              Evaluation Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="reviewer"
                className="text-sm font-semibold text-slate-900 block"
              >
                Reviewer Name
              </label>
              <input
                type="text"
                id="reviewer"
                name="reviewer"
                placeholder="Manager's Name"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rating"
                className="text-sm font-semibold text-slate-900 block"
              >
                Overall Rating (1-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="1"
                max="5"
                step="0.1"
                placeholder="4.5"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* --- Bottom Section: Detailed Feedback --- */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="strengths"
              className="text-sm font-semibold text-slate-900 block"
            >
              Key Strengths
            </label>
            <textarea
              id="strengths"
              name="strengths"
              rows={3}
              placeholder="Detail the employee's top contributions and strengths..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="improvements"
              className="text-sm font-semibold text-slate-900 block"
            >
              Areas for Improvement
            </label>
            <textarea
              id="improvements"
              name="improvements"
              rows={3}
              placeholder="What skills or behaviors could be developed further?"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="managerComments"
                className="text-sm font-semibold text-slate-900 block"
              >
                Managers Final Comments
              </label>
              <textarea
                id="managerComments"
                name="managerComments"
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employeeComments"
                className="text-sm font-semibold text-slate-900 block"
              >
                Employees Comments (Optional)
              </label>
              <textarea
                id="employeeComments"
                name="employeeComments"
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y"
              ></textarea>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="goalsForNextCycle"
              className="text-sm font-semibold text-slate-900 block"
            >
              Goals for Next Cycle
            </label>
            <textarea
              id="goalsForNextCycle"
              name="goalsForNextCycle"
              rows={3}
              placeholder="Define 1-3 primary objectives for the next review period..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all resize-y"
            ></textarea>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            href="/dashboard/performance/reviews"
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
