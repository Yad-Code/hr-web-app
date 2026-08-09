import React from "react";
import {
  Briefcase,
  Users,
  UserCheck,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { InputField, SelectField } from "./formControls";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

export function CurrentPositionSection({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <InputField
          label="Job Title"
          name="jobTitle"
          defaultValue={profile.jobTitle || profile.role || ""}
          icon={Briefcase}
          placeholder="e.g. Senior Developer"
        />
        <InputField
          label="Job Family"
          name="jobFamily"
          defaultValue={profile.jobFamily || ""}
          icon={Users}
          placeholder="e.g. Engineering"
        />
        <SelectField
          label="Employment Type"
          name="employmentType"
          defaultValue={profile.employmentType || "Full-Time"}
          icon={UserCheck}
          options={["Full-Time", "Part-Time", "Contract", "Internship"]}
        />
        <InputField
          label="Department"
          name="department"
          defaultValue={profile.department || ""}
          icon={Building2}
          placeholder="e.g. Software Engineering"
        />
        <InputField
          label="Branch / Location"
          name="branch"
          defaultValue={profile.branch || ""}
          icon={MapPin}
          placeholder="e.g. HQ - Sulaymaniyah"
        />
        <InputField
          label="Direct Manager"
          name="managerName"
          defaultValue={profile.managerName || ""}
          icon={UserCheck}
          placeholder="Manager's Name"
        />
        <InputField
          label="Join Date"
          name="joinDate"
          type="date"
          defaultValue={profile.joinDate || ""}
          icon={Calendar}
        />
        <InputField
          label="Basic Salary (IQD)"
          name="baseSalary"
          type="number"
          defaultValue={
            profile.base_salary != null ? String(profile.base_salary) : ""
          }
          icon={DollarSign}
          placeholder="1340000"
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={profile.status || "Active"}
          icon={ShieldCheck}
          options={["Active", "Inactive", "On Leave", "Terminated"]}
        />
      </div>
    </div>
  );
}
