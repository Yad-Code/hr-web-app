"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";
import { updateAdminJobInformation } from "@/app/lib/employeeList/actions";

import { AdminHeader } from "./job/adminHeader";
import { CurrentPositionSection } from "./job/currentPositionSection";
import { OrganizationDetailsSection } from "./job/organizationDetailsSection";
import { EmploymentHistoryTimeline } from "./job/employmentHistoryTimeline";

interface AdminJobInformationTabProps {
  profile: FullEmployeeProfile;
}

export default function AdminJobInformationTab({
  profile,
}: AdminJobInformationTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const initialFormState: Record<string, string> = {
    jobTitle: profile.jobTitle || profile.role || "",
    jobFamily: profile.jobFamily || "",
    employmentType: profile.employmentType || "Full-Time",
    department: profile.department || "",
    branch: profile.branch || "",
    managerName: profile.managerName || "",
    joinDate: profile.joinDate || "",
    base_salary: profile.base_salary != null ? String(profile.base_salary) : "",
    status: profile.status || "Active",
    publicOrg: profile.publicOrg || "",
    privateOrg: profile.privateOrg || "",
    insurance: profile.insurance || "",
    subscription: profile.subscription || "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const history = profile.history || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateAdminJobInformation(profile.id, formData);
      setFeedback(res);

      if (res.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader />

      {/* Action Notification Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            feedback.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {feedback.success ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <CurrentPositionSection formData={formData} onChange={handleChange} />

        <OrganizationDetailsSection
          formData={formData}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
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
