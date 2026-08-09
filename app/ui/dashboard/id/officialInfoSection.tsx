"use client";

import React from "react";
import { FullEmployeeProfile } from "@/app/lib/employeeList/definitions";
import { InputField, SelectField } from "./formFields";
import { Lock, Hash, User, Mail, Calendar, Globe, Shield } from "lucide-react";

const formatDateForInput = (dateVal: string | Date | null | undefined) => {
  if (!dateVal) return "";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function OfficialInfoSection({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Official Information
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
          Restricted
        </span>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <InputField
          label="Employee ID"
          id="employeeId"
          name="employeeId"
          icon={Hash}
          defaultValue={profile.employee_id}
          mono
        />
        <InputField
          label="Full Legal Name"
          id="name"
          name="name"
          icon={User}
          defaultValue={profile.name}
          required
        />
        <InputField
          label="Work Email"
          id="email"
          name="email"
          type="email"
          icon={Mail}
          defaultValue={profile.email}
          required
        />
        <InputField
          label="Date of Birth"
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          icon={Calendar}
          defaultValue={formatDateForInput(profile.date_of_birth)}
        />

        <SelectField
          label="Gender"
          id="gender"
          name="gender"
          icon={User}
          defaultValue={profile.gender || "Other"}
          options={["Male", "Female", "Other"]}
        />

        <InputField
          label="Nationality"
          id="nationality"
          name="nationality"
          icon={Globe}
          defaultValue={profile.nationality}
        />

        <SelectField
          label="System Role"
          id="role"
          name="role"
          icon={Shield}
          defaultValue={profile.role?.toLowerCase() || "employee"}
          options={[
            { label: "Employee", value: "employee" },
            { label: "Admin", value: "admin" },
          ]}
        />
      </div>
    </div>
  );
}
