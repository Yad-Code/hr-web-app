// @/app/ui/dashboard/id/tabs/adminPermissionsTab.tsx
"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Key,
  ShieldAlert,
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";
import { updateEmployeeDetails } from "@/app/lib/employeeList/actions";

function PermissionToggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(defaultChecked || false);

  return (
    <div
      onClick={() => setIsEnabled(!isEnabled)}
      className="flex items-start justify-between gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none"
    >
      <input type="hidden" name={name} value={String(isEnabled)} />
      <div className="flex flex-col pr-4">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">
          {description}
        </span>
      </div>
      <div
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isEnabled ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </div>
  );
}

export default function AdminPermissionsTab({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
  const router = useRouter();
  const updateProfileWithId = updateEmployeeDetails.bind(null, profile.id);
  const [state, formAction, isPending] = useActionState(
    updateProfileWithId,
    null,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!state?.success) return;
    router.refresh();
    const t1 = setTimeout(() => setShowSuccess(true), 0);
    const t2 = setTimeout(() => setShowSuccess(false), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [state, router]);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {showSuccess && state?.success && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border bg-emerald-50 border-emerald-200 text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          {state.message}
        </div>
      )}
      {state && !state.success && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border bg-rose-50 border-rose-200 text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="isPermissionsForm" value="true" />

        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              System Permissions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PermissionToggle
              key={`admin-${profile.isAdmin}`}
              name="isAdmin"
              label="System Administrator"
              description="Grants full access to payroll, settings, and all directories."
              defaultChecked={profile.isAdmin}
            />
            <PermissionToggle
              key={`manager-${profile.isManager}`}
              name="isManager"
              label="Manager Dashboard"
              description="Grants access to team-level analytics and schedule oversight."
              defaultChecked={profile.isManager}
            />
            <PermissionToggle
              key={`leaves-${profile.canApproveLeaves}`}
              name="canApproveLeaves"
              label="Approve Time-Off"
              description="Allows user to accept or reject team absence requests."
              defaultChecked={profile.canApproveLeaves}
            />
            <PermissionToggle
              key={`reviews-${profile.canStartReviews}`}
              name="canStartReviews"
              label="Initiate Reviews"
              description="Allows user to start formal performance review cycles."
              defaultChecked={profile.canStartReviews}
            />
            <PermissionToggle
              key={`workspace-${profile.hasEmployeeView}`}
              name="hasEmployeeView"
              label="Personal Workspace"
              description="Allows user to access their own employee profile and time-off requests."
              defaultChecked={profile.hasEmployeeView !== false}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="reset"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Permissions
          </button>
        </div>
      </form>
    </div>
  );
}
