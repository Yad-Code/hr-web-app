// @/app/ui/dashboard/id/profileForm.tsx
"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployeeProfile } from "@/app/lib/employeeList/actions";
import { FullEmployeeProfile } from "@/app/lib/employeeList/definitions";
import {
  EducationItem,
  LanguageItem,
  EmployeeDocument,
} from "@/app/lib/employee/definitions";
import { Check, Loader2 } from "lucide-react";

import OfficialInfoSection from "./officialInfoSection";
import PersonalInfoSection from "./personalInfoSection";
import DocumentsTab from "@/app/ui/employee/profile/tabs/documentsTab"; // Your Documents component

interface ProfileFormProps {
  profile: FullEmployeeProfile;
  educationHistory?: EducationItem[];
  languageHistory?: LanguageItem[];
  documents?: EmployeeDocument[];
}

export default function ProfileForm({
  profile,
  educationHistory = [],
  languageHistory = [],
  documents = [],
}: ProfileFormProps) {
  const router = useRouter();
  const updateProfileWithId = updateEmployeeProfile.bind(null, profile.id);
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
    <form action={formAction} className="space-y-6">
      {/* Notifications */}
      {showSuccess && state?.success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          {state.message}
        </div>
      )}
      {state && !state.success && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
          {state.message}
        </div>
      )}

      {/* Main Official & Personal Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <OfficialInfoSection profile={profile} />
        <PersonalInfoSection profile={profile} />
      </div>

      {/* Save Button Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xs p-3.5 sm:p-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-6 bg-blue-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Main Changes
            </>
          )}
        </button>
      </div>

     
    </form>
  );
}
