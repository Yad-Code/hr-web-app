// @/app/ui/dashboard/id/profileForm.tsx

"use client";

import { useActionState } from "react";
import { updateEmployeeProfile } from "@/app/lib/employeeList/actions";

interface ProfileFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
    status?: string;
  };
  userEmail: string;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  // Bind the current employee ID to the server action
  const updateProfileWithId = updateEmployeeProfile.bind(null, profile.id);
  const [state, formAction, isPending] = useActionState(
    updateProfileWithId,
    null,
  );

  return (
    <form
      action={formAction}
      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
    >
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
        Edit Account Details
      </h3>

      {state?.message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold ${
            state.success
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Name Input */}
      <div className="space-y-1">
        <label
          htmlFor="name"
          className="block text-xs font-semibold text-slate-700"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={profile.name}
          required
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Email Input */}
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={profile.email}
          required
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Department Input */}
      <div className="space-y-1">
        <label
          htmlFor="department"
          className="block text-xs font-semibold text-slate-700"
        >
          Department
        </label>
        <input
          id="department"
          name="department"
          type="text"
          defaultValue={profile.department || ""}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Role & Status Controls */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <label
            htmlFor="role"
            className="block text-xs font-semibold text-slate-700"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={profile.role?.toLowerCase() || "employee"}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="status"
            className="block text-xs font-semibold text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={profile.status?.toLowerCase() || "active"}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="pt-3">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? "Saving Changes..." : "Save Profile Changes"}
        </button>
      </div>
    </form>
  );
}
