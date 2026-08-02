// @/app/ui/employee/profile/tabs/jobInformationTab.tsx
"use client";

import React from "react";
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
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";  

interface JobInformationTabProps {
  profile: FullEmployeeProfile; // 👈 Use the interface here
}

export default function JobInformationTab({ profile }: JobInformationTabProps) {
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return "1,340,000 IQD";
    return `${amount.toLocaleString()} IQD`;
  };

  // Optional chaining handles both null and undefined
  const isStatusActive = profile.status?.toLowerCase() === "active";

  // Mock fallbacks for extended schema fields
  const history = profile.history || [
    {
      title: profile.role || "Software Engineer",
      period: "Mar 2022 → Present",
    },
    { title: "Junior Developer", period: "Jan 2021 → Feb 2022" },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
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
          <InfoCard
            icon={Briefcase}
            label="Current Position"
            value={profile.role || "Software Engineer"}
            highlight
          />
          <InfoCard
            icon={Users}
            label="Job Family"
            value={profile.jobFamily || "Engineering"}
          />
          <InfoCard
            icon={UserCheck}
            label="Employment Type"
            value={profile.employmentType || "Full-Time"}
          />
          <InfoCard
            icon={Building2}
            label="Department"
            value={profile.department || "Software Engineering"}
          />
          <InfoCard
            icon={MapPin}
            label="Branch"
            value={profile.branch || "HQ - Sulaymaniyah"}
          />
          <InfoCard
            icon={UserCheck}
            label="Manager"
            value={profile.managerName || "Sarah Jenkins"}
          />
          <InfoCard
            icon={Calendar}
            label="Join Date"
            value={profile.joinDate || "01 Mar 2022"}
          />
          <InfoCard
            icon={DollarSign}
            label="Basic Salary"
            value={formatCurrency(profile.base_salary)}
            accent
          />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Status
            </span>
            <div className="pt-0.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isStatusActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isStatusActive
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-400"
                  }`}
                />
                {isStatusActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
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
          <InfoCard
            icon={Building}
            label="Public Organization"
            value={profile.publicOrg || "—"}
          />
          <InfoCard
            icon={Building2}
            label="Private Organization"
            value={profile.privateOrg || "ABC Technologies"}
          />
          <InfoCard
            icon={ShieldCheck}
            label="Insurance"
            value={profile.insurance || "Private Insurance"}
          />
          <InfoCard
            icon={UserCheck}
            label="Subscription"
            value={profile.subscription || "Standard"}
          />
        </div>
      </div>

      {/* SECTION 3: EMPLOYMENT HISTORY */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Employment History
          </h2>
        </div>

        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
          {history.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
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

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
  accent?: boolean;
}

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight,
  accent,
}: InfoCardProps) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </span>
      <p
        className={`text-xs sm:text-sm font-semibold truncate ${
          accent
            ? "text-indigo-600 font-bold"
            : highlight
              ? "text-slate-900 font-bold"
              : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
