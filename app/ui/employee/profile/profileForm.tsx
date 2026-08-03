// @/app/ui/employee/profile/profileForm.tsx

"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployeeProfile } from "@/app/lib/employeeDashboard/employee/actions";
import { UserPen, User, Mail, Phone, Check, Loader2 } from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

interface ProfileFormProps {
  profile: FullEmployeeProfile;
  userEmail: string;
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateEmployeeProfile,
    null,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!state?.success) return;

    router.refresh();

    const showTimer = setTimeout(() => {
      setShowSuccess(true);
    }, 0);

    const hideTimer = setTimeout(() => {
      setShowSuccess(false);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [state, router]);

  return (
    <form action={formAction} className="h-full">
      {/* Hidden identifier fields */}
      <input type="hidden" name="email" value={userEmail} />
      <input
        type="hidden"
        name="employeeId"
        value={profile.employee_id || ""}
      />

      <div className="h-full flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs transition-all hover:shadow-sm space-y-6">
        <div className="space-y-5">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <UserPen className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                Editable Contact Details
              </h2>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
              Editable
            </span>
          </div>

          {/* Alert Notifications */}
          {showSuccess && (
            <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile changes saved successfully!</span>
            </div>
          )}

          {state?.error && (
            <div className="p-3 bg-rose-50/90 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-700 animate-in fade-in slide-in-from-top-1 duration-200">
              {state.error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Preferred Name Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Username / Preferred Name
              </label>
              <input
                key={profile.preferred_name || profile.name}
                type="text"
                name="preferredName"
                defaultValue={profile.preferred_name || profile.name}
                placeholder="Enter preferred name"
                className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-900 text-sm font-semibold rounded-xl p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {state?.fieldErrors?.preferredName && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {state.fieldErrors.preferredName[0]}
                </p>
              )}
            </div>

            {/* Personal Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Personal Email
              </label>
              <input
                key={profile.personal_email}
                type="email"
                name="personalEmail"
                defaultValue={profile.personal_email || profile.email}
                placeholder="name@example.com"
                className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-900 text-sm font-semibold rounded-xl p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {state?.fieldErrors?.personalEmail && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {state.fieldErrors.personalEmail[0]}
                </p>
              )}
            </div>

            {/* Personal Phone Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Personal Phone Number
              </label>
              <input
                key={profile.personal_phone}
                type="tel"
                name="personalPhone"
                defaultValue={profile.personal_phone || ""}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-900 text-sm font-semibold rounded-xl p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-xs hover:shadow-indigo-500/10 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
