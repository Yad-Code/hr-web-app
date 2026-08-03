// @/app/ui/dashboard/id/adminJobInformationTab.tsx
"use client";

import React, { useState, useTransition } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Building,
  History,
  MapPin,
  Users,
  Save,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

interface AdminJobInformationTabProps {
  profile: FullEmployeeProfile;
}

export default function AdminJobInformationTab({
  profile,
}: AdminJobInformationTabProps) {
  const [isPending, startTransition] = useTransition();

  // Initialize form state with profile data or fallbacks
  const initialFormState = {
    jobTitle: profile.jobTitle || profile.role || "",
    jobFamily: profile.jobFamily || "",
    employmentType: profile.employmentType || "Full-Time",
    department: profile.department || "",
    branch: profile.branch || "",
    managerName: profile.managerName || "",
    joinDate: profile.joinDate || "",
    base_salary: profile.base_salary || "",
    status: profile.status || "Active",
    publicOrg: profile.publicOrg || "",
    privateOrg: profile.privateOrg || "",
    insurance: profile.insurance || "",
    subscription: profile.subscription || "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Mock fallbacks for history timeline[cite: 3]
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        // Replace with your actual server action
        // const { updateJobInformation } = await import("@/app/lib/employee/profile/actions");
        // await updateJobInformation(profile.id, formData);

        console.log("Saving job data for:", profile.id, formData);

        // Simulating network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (err) {
        console.error("Failed to update job information:", err);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* ADMIN CONTROL HEADER */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold tracking-wide">
            Admin Job Information Management
          </h2>
        </div>
        <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          Target Employee ID: {profile.employee_id || "N/A"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CURRENT POSITION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Current Position
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              icon={Briefcase}
              placeholder="e.g. Senior Developer"
            />
            <InputField
              label="Job Family"
              name="jobFamily"
              value={formData.jobFamily}
              onChange={handleChange}
              icon={Users}
              placeholder="e.g. Engineering"
            />
            <SelectField
              label="Employment Type"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              icon={UserCheck}
              options={["Full-Time", "Part-Time", "Contract", "Internship"]}
            />
            <InputField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              icon={Building2}
              placeholder="e.g. Software Engineering"
            />
            <InputField
              label="Branch / Location"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              icon={MapPin}
              placeholder="e.g. HQ - Sulaymaniyah"
            />
            <InputField
              label="Direct Manager"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              icon={UserCheck}
              placeholder="Manager's Name"
            />
            <InputField
              label="Join Date"
              name="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={handleChange}
              icon={Calendar}
            />
            <InputField
              label="Basic Salary (IQD)"
              name="base_salary"
              type="number"
              value={formData.base_salary}
              onChange={handleChange}
              icon={DollarSign}
              placeholder="1340000"
            />
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              icon={ShieldCheck}
              options={["Active", "Inactive", "On Leave", "Terminated"]}
            />
          </div>
        </div>

        {/* SECTION 2: ORGANIZATION DETAILS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Organization Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <InputField
              label="Public Organization"
              name="publicOrg"
              value={formData.publicOrg}
              onChange={handleChange}
              icon={Building}
              placeholder="—"
            />
            <InputField
              label="Private Organization"
              name="privateOrg"
              value={formData.privateOrg}
              onChange={handleChange}
              icon={Building2}
              placeholder="e.g. ABC Tech"
            />
            <InputField
              label="Insurance"
              name="insurance"
              value={formData.insurance}
              onChange={handleChange}
              icon={ShieldCheck}
              placeholder="Insurance Provider"
            />
            <InputField
              label="Subscription"
              name="subscription"
              value={formData.subscription}
              onChange={handleChange}
              icon={UserCheck}
              placeholder="e.g. Standard"
            />
          </div>
        </div>

        {/* SAVE BUTTONS */}
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

      {/* SECTION 3: EMPLOYMENT HISTORY TIMELINE (Read-Only) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Employment History Log
          </h2>
        </div>

        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
          {history.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Dot[cite: 3] */}
              <div className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {item.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reusable Input Field Component
function InputField({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-slate-900 focus:border-slate-900 block p-2.5 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100/80 ${
            Icon ? "pl-9" : ""
          }`}
          placeholder={placeholder}
          {...props}
        />
      </div>
    </div>
  );
}

// Reusable Select Field Component
function SelectField({
  label,
  options,
  icon: Icon,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <select
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-slate-900 focus:border-slate-900 block p-2.5 outline-none transition-all cursor-pointer ${
            Icon ? "pl-9" : ""
          }`}
          {...props}
        >
          <option value="">Select Option...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
