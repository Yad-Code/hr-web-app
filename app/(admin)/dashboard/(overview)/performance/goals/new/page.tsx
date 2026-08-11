// @/app/(admin)/dashboard/(overview)/performance/goals/new/page.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { createNewGoal } from "@/app/lib/admin/performance/actions";
import { SubmitButton } from "./submit-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EmployeeRow {
  id: string;
  name: string;
  department: string;
}

export default async function NewGoalPage() {
  const employees = (await db`
    SELECT id, name, department 
    FROM users 
    WHERE status = 'Active' 
    ORDER BY name ASC
  `) as unknown as EmployeeRow[];

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
          <h1 className="text-xl font-bold text-slate-900">Assign New Goal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create a new measurable objective for an employee.
          </p>
        </div>
      </div>

      <form
        action={createNewGoal}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="userId"
            className="text-sm font-semibold text-slate-900 block"
          >
            Assign To
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
            htmlFor="title"
            className="text-sm font-semibold text-slate-900 block"
          >
            Goal Title / Objective
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g., Launch V2 of the Client Dashboard"
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="text-sm font-semibold text-slate-900 block"
            >
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              required
              defaultValue="Medium"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dueDate"
              className="text-sm font-semibold text-slate-900 block"
            >
              Target Completion Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-slate-700"
            />
          </div>
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
