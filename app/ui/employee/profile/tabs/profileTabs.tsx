"use client";

import React, { useState } from "react";
import JobInformationTab from "./jobInformationTab";
import OfficialInfoCard from "../officialInfoCard";
import ProfileForm from "../profileForm";
import EducationTab from "./educationTab";
import LanguageTab from "./languageTab"; // 👈 1. Import Language Tab
import {
  Briefcase,
  Shield,
  UserPen,
  GraduationCap,
  Languages, // 👈 2. Import Languages Icon
} from "lucide-react";
import {
  ProfileTabsProps,
  ProfileTabType,
} from "@/app/lib/employee/definitions";

export default function ProfileTabs({
  profile,
  userEmail,
  educationHistory,
  languageHistory = [], // 👈 3. Accept languageHistory prop
}: ProfileTabsProps) {
  // 👈 4. Include "language" in the activeTab state type
  const [activeTab, setActiveTab] = useState<ProfileTabType>("job");

  return (
    <div className="space-y-6">
      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 gap-2 bg-white p-1.5 rounded-2xl border shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "job"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Information
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("official")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "official"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Shield className="w-4 h-4" />
          Official Information
        </button>

        {/* Education Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "education"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Education History
        </button>

        {/* 👈 5. New Language Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("language")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "language"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Languages className="w-4 h-4" />
          Languages
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "edit"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <UserPen className="w-4 h-4" />
          Edit Personal Details
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === "job" && <JobInformationTab profile={profile} />}
        {activeTab === "official" && <OfficialInfoCard profile={profile} />}
        {activeTab === "education" && (
          <EducationTab
            educationHistory={educationHistory}
            userId={profile.id}
          />
        )}
        {/* 👈 6. Render Language Tab */}
        {activeTab === "language" && (
          <LanguageTab
            languageHistory={languageHistory}
            userId={profile.id}
            employeeId={profile.employee_id}
            employeeName={profile.name}
          />
        )}
        {activeTab === "edit" && (
          <ProfileForm profile={profile} userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
