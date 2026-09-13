// @/app/ui/dashboard/id/adminJobInformationTab.tsx
"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Save,
  Loader2,
  Check,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";
import { updateEmployeeDetails } from "@/app/lib/employeeList/actions";

import { AdminHeader } from "./job/adminHeader";
import { CurrentPositionSection } from "./job/currentPositionSection";
import { OrganizationDetailsSection } from "./job/organizationDetailsSection";
import { EmploymentHistoryTimeline } from "./job/employmentHistoryTimeline";

export default function AdminJobInformationTab({
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

  const history = profile.history || [];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader />

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
        <input type="hidden" name="isJobForm" value="true" />

        <CurrentPositionSection profile={profile} />
        <OrganizationDetailsSection profile={profile} />

        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              System Permissions
            </h2>
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
            Save Job Details
          </button>
        </div>
      </form>

      <EmploymentHistoryTimeline history={history} />
    </div>
  );
}
