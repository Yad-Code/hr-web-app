// @/app/ui/dashboard/id/profileForm.tsx
"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployeeProfile } from "@/app/lib/employeeList/actions";
import { FullEmployeeProfile } from "@/app/lib/employeeList/definitions";
import {
  Edit2,
  User,
  Mail,
  Briefcase,
  Shield,
  Activity,
  Check,
  Loader2,
  Heart,
  Droplet,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Hash,
  Lock,
  DollarSign,
} from "lucide-react";

interface ProfileFormProps {
  profile: FullEmployeeProfile;
}

const formatDateForInput = (dateVal: string | Date | null | undefined) => {
  if (!dateVal) return "";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function ProfileForm({ profile }: ProfileFormProps) {
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
    <form action={formAction} className="space-y-4 sm:space-y-5">
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* OFFICIAL INFORMATION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
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
              label="Department"
              id="department"
              name="department"
              icon={Briefcase}
              defaultValue={profile.department}
            />
            <InputField
              label="Branch"
              id="branch"
              name="branch"
              icon={Briefcase}
              defaultValue={profile.branch}
            />
            <InputField
              label="Monthly Base Salary ($)"
              id="baseSalary"
              name="baseSalary"
              type="number"
              icon={DollarSign}
              defaultValue={profile.base_salary ?? 3500}
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

            <SelectField
              label="Status"
              id="status"
              name="status"
              icon={Activity}
              defaultValue={profile.status?.toLowerCase() || "active"}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Personal Information
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
              Editable
            </span>
          </div>

          <div className="space-y-3">
            <InputField
              label="Preferred Name"
              id="preferredName"
              name="preferredName"
              icon={User}
              defaultValue={profile.preferred_name || profile.name}
            />

            <SelectField
              label="Marital Status"
              id="maritalStatus"
              name="maritalStatus"
              icon={Heart}
              defaultValue={profile.marital_status || "Single"}
              options={["Single", "Married", "Divorced", "Widowed"]}
            />

            <SelectField
              label="Blood Group"
              id="bloodGroup"
              name="bloodGroup"
              icon={Droplet}
              defaultValue={profile.blood_group || "Unknown"}
              options={[
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
                "Unknown",
              ]}
            />

            <InputField
              label="Personal Email"
              id="personalEmail"
              name="personalEmail"
              type="email"
              icon={Mail}
              defaultValue={profile.personal_email}
            />

            <InputField
              label="Personal Phone"
              id="personalPhone"
              name="personalPhone"
              type="tel"
              icon={Phone}
              defaultValue={profile.personal_phone}
            />

            <div className="space-y-1">
              <label
                htmlFor="currentAddress"
                className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Current Address
              </label>
              <textarea
                id="currentAddress"
                name="currentAddress"
                defaultValue={profile.current_address || ""}
                rows={3}
                className="w-full text-xs sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Footer */}
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
              Save All Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultValue?: string | number | null;
  required?: boolean;
  mono?: boolean;
}

function InputField({
  label,
  id,
  name,
  type = "text",
  icon: Icon,
  defaultValue,
  required,
  mono,
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
      >
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={`w-full text-xs sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

type SelectOption = string | { label: string; value: string };

interface SelectFieldProps {
  label: string;
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultValue?: string | number | null;
  options: SelectOption[];
}

function SelectField({
  label,
  id,
  name,
  icon: Icon,
  defaultValue,
  options,
}: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
      >
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full text-xs sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const labelText = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {labelText}
            </option>
          );
        })}
      </select>
    </div>
  );
}
