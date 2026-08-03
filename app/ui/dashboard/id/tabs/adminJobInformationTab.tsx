"use client";

import React, { useState, useTransition } from "react";
import { RotateCcw, Save, Loader2 } from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

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
  const [isPending, startTransition] = useTransition();

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

  const history = profile.history || [
    {
      title: profile.role || "Software Engineer",
      period: "Mar 2022 → Present",
    },
    { title: "Junior Developer", period: "Jan 2021 → Feb 2022" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        console.log("Saving job data for:", profile.id, formData);
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (err) {
        console.error("Failed to update job information:", err);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader />

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
