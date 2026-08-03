// @/app/ui/employee/profile/tabs/profileTabs.tsx

"use client";

import React, { useState } from "react";
import JobInformationTab from "./jobInformationTab";
import OfficialInfoCard from "../officialInfoCard";
import ProfileForm from "../profileForm";
import EducationTab from "./educationTab";
import LanguageTab from "./languageTab";
import DocumentsTab from "./documentsTab"; // 👈 1. Import DocumentsTab component
import {
  Briefcase,
  UserPen,
  GraduationCap,
  Languages,
  FileText,
} from "lucide-react";
import {
  ProfileTabsProps,
  ProfileTabType,
} from "@/app/lib/employee/definitions";

export default function ProfileTabs({
  profile,
  userEmail,
  educationHistory = [],
  languageHistory = [],
  documents = [],
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabType>("personal");

  return (
    <div className="space-y-6">
      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 gap-2 bg-white p-1.5 rounded-2xl border shadow-xs overflow-x-auto">
        {/* Personal Details Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "personal"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <UserPen className="w-4 h-4" />
          Personal Details
        </button>

        {/* Job Information Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "job"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Information
        </button>

        {/* Education Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "education"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Education History
        </button>

        {/* Language Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("language")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "language"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Languages className="w-4 h-4" />
          Languages
        </button>

        {/* 👈 3. Added Documents Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "documents"
              ? "bg-indigo-50 text-indigo-600 shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Documents
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <OfficialInfoCard profile={profile} />
            <ProfileForm profile={profile} userEmail={userEmail} />
          </div>
        )}

        {activeTab === "job" && <JobInformationTab profile={profile} />}

        {activeTab === "education" && (
          <EducationTab
            educationHistory={educationHistory}
            userId={profile.id}
          />
        )}

        {activeTab === "language" && (
          <LanguageTab
            languageHistory={languageHistory}
            userId={profile.id}
            employeeId={profile.employee_id ?? undefined}
            employeeName={profile.name}
          />
        )}

        {/* 👈 4. Added Documents Tab View */}
        {activeTab === "documents" && <DocumentsTab documents={documents} />}
      </div>
    </div>
  );
}
