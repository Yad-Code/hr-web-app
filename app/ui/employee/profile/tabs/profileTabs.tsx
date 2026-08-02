// app/ui/employee/profile/tabs/profileTabs.tsx
"use client";

import React, { useState } from "react";
import JobInformationTab from "./jobInformationTab";
import OfficialInfoCard from "../officialInfoCard";
import ProfileForm from "../profileForm";
import { Briefcase, Shield, UserPen } from "lucide-react";
import {
  ProfileTabsProps,
  ProfileTabType,
} from "@/app/lib/employee/definitions";

export default function ProfileTabs({ profile, userEmail }: ProfileTabsProps) {
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
        {activeTab === "edit" && (
          <ProfileForm profile={profile} userEmail={userEmail} />
        )}
      </div>
    </div>  
  );
}
