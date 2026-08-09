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
}: {
  profile: FullEmployeeProfile;
}) {
  const [formData, setFormData] = useState({
    jobFamily: profile.jobFamily || "",
    jobTitle: profile.jobTitle || profile.role || "",
    employmentType: profile.employmentType || "Full-Time",
    department: profile.department || "",
    branch: profile.branch || "",
    managerName: profile.managerName || "",
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
      jobTitle: "", // Reset job title when family changes
    }));
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Optional validation trigger if parent form validates on submit/change
  const validateFields = () => {
    if (formData.baseSalary !== "") {
      const salary = parseFloat(formData.baseSalary);
      if (isNaN(salary) || salary < 0) {
        setError("Validation Error: Basic salary cannot be negative.");
        return false;
      }
    }

    if (formData.joinDate) {
      const selectedDate = new Date(formData.joinDate);
      const today = new Date();
      if (selectedDate > today) {
        setError("Validation Error: Join date cannot be set in the future.");
        return false;
      }
    }

    setError(null);
    return true;
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
          onChange={(e) => {
            handleChange(e);
            validateFields();
          }}
          icon={Calendar}
        />
        <InputField
          label="Basic Salary (IQD)"
          name="baseSalary"
          type="number"
          value={formData.baseSalary}
          onChange={(e) => {
            handleChange(e);
            validateFields();
          }}
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
