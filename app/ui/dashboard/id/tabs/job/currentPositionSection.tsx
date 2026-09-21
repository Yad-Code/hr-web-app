import React, { useState } from "react";
import {
  Briefcase,
  Users,
  UserCheck,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { InputField, SelectField } from "./formControls";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

const JOB_FAMILIES_TITLES_MAP: Record<string, string[]> = {
  Engineering: [
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Engineer",
    "Computer Engineer",
    "Software Engineer",
    "DevOps Engineer",
  ],
  Product: ["Product Manager", "Product Owner", "UI/UX Designer"],
  "Human Resources": ["HR Manager", "HR Specialist", "Recruiter"],
  Finance: ["Financial Analyst", "Accountant", "Payroll Specialist"],
  Operations: ["Operations Manager", "Support Specialist"],
};

export function CurrentPositionSection({
  profile,
  managersList = [],
}: {
  profile: FullEmployeeProfile;
  managersList?: { id: string; name: string; department: string }[];
}) {
  const [formData, setFormData] = useState({
    jobFamily: profile.jobFamily || "",
    jobTitle: profile.jobTitle || profile.role || "",
    employmentType: profile.employmentType || "Full-Time",
    department: profile.department || "",
    branch: profile.branch || "",
    managerId: profile.managerId || "",
    joinDate: profile.joinDate || "",
    baseSalary: profile.base_salary != null ? String(profile.base_salary) : "",
    status: profile.status || "Active",
  });

  const [error, setError] = useState<string | null>(null);

  const handleJobFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobFamily = e.target.value;
    setFormData((prev) => ({
      ...prev,
      jobFamily,
      jobTitle: "",
    }));
    setError(null);
  };

  // 👇 FIXED: Validates the immediate user input rather than waiting for async state updates
  const validateFields = (name: string, value: string) => {
    if (name === "baseSalary" && value !== "") {
      const salary = parseFloat(value);
      if (isNaN(salary) || salary < 0) {
        setError("Validation Error: Basic salary cannot be negative.");
        return false;
      }
    }
    if (name === "joinDate" && value !== "") {
      const selectedDate = new Date(value);
      const today = new Date();
      if (selectedDate > today) {
        setError("Validation Error: Join date cannot be set in the future.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateFields(name, value);
  };

  const availableJobTitles = formData.jobFamily
    ? JOB_FAMILIES_TITLES_MAP[formData.jobFamily] || []
    : [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Briefcase className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Current Position
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SelectField
          label="Job Family"
          name="jobFamily"
          value={formData.jobFamily}
          onChange={handleJobFamilyChange}
          icon={Users}
          options={Object.keys(JOB_FAMILIES_TITLES_MAP)}
          placeholder="Select Job Family..."
        />
        <SelectField
          label="Job Title"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          icon={Briefcase}
          options={availableJobTitles}
          disabled={!formData.jobFamily}
          placeholder={
            formData.jobFamily
              ? "Select Job Title..."
              : "Select Job Family first"
          }
        />
        <SelectField
          label="Employment Type"
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          icon={UserCheck}
          options={["Full-Time", "Part-Time", "Contract", "Internship"]}
        />

        <SelectField
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          icon={Building2}
          options={[
            "Engineering",
            "Human Resources",
            "Design",
            "Marketing",
            "Sales",
            "Finance",
            "Operations",
          ]}
          placeholder="Select Department..."
        />

        <SelectField
          label="Branch / Location"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          icon={MapPin}
          options={[
            "HQ - Sulaymaniyah",
            "Erbil Branch",
            "Duhok Branch",
            "Basra Branch",
            "Remote",
          ]}
          placeholder="Select Branch..."
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Direct Manager
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserCheck className="h-4 w-4 text-slate-400" />
            </div>
            <select
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all cursor-pointer pl-9"
            >
              <option value="none">No Manager (Top Level)</option>
              {managersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>
        </div>

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
          name="baseSalary"
          type="number"
          value={formData.baseSalary}
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
  );
}
