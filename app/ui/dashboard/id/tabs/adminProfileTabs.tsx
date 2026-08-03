// @/app/ui/dashboard/id/adminProfileTabs.tsx
"use client";

import React, { useState } from "react";
import ProfileForm from "../profileForm"; 
import {
  UserPen,
  Briefcase,
  GraduationCap,
  Languages,
  FileText,
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";
import {
  EducationItem,
  LanguageItem,
  EmployeeDocument,
} from "@/app/lib/employee/definitions";
import AdminLanguageTab from "./adminLanguageTab";
import AdminJobInformationTab from "./adminJobInformationTab";
import AdminEducationTab from "./adminEducationTab";
import AdminDocumentsTab from "./adminDocumentsTab";

export type AdminTabType =
  | "profile"
  | "job"
  | "education"
  | "language"
  | "documents";

interface AdminProfileTabsProps {
  profile: FullEmployeeProfile;
  educationHistory?: EducationItem[];
  languageHistory?: LanguageItem[];
  documents?: EmployeeDocument[];
}

export default function AdminProfileTabs({
  profile,
  educationHistory = [],
  languageHistory = [],
  documents = [],
}: AdminProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>("profile");

  const tabs = [
    { id: "profile", label: "Edit Profile & Official Info", icon: UserPen },
    { id: "job", label: "Job Details", icon: Briefcase },
    { id: "education", label: "Education History", icon: GraduationCap },
    { id: "language", label: "Languages", icon: Languages },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 bg-white p-1.5 rounded-2xl border shadow-xs overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Content */}
      <div>
        {/* 1. Admin Edit Profile Form (Official + Personal info) */}
        {activeTab === "profile" && <ProfileForm profile={profile} />}

        {/* 2. Job Information */}
        {activeTab === "job" && <AdminJobInformationTab profile={profile} />}

        {/* 3. Education History */}
        {activeTab === "education" && (
          <AdminEducationTab
            educationHistory={educationHistory}
            userId={profile.id}
          />
        )}

        {/* 4. Languages */}
        {activeTab === "language" && (
          <AdminLanguageTab
            languageHistory={languageHistory}
            userId={profile.id}
            employeeId={profile.employee_id}
            employeeName={profile.name}
          />
        )}

        {/* 5. Documents */}
        {activeTab === "documents" && (
          <AdminDocumentsTab
            documents={documents}
            userId={profile.id}
          />
        )}
      </div>
    </div>
  );
}
