// @/app/ui/employee/profile/officialInfoCard.tsx

import { Lock, User, Globe, Calendar, Briefcase } from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions"; // 👈 Fixed import path

export default function OfficialInfoCard({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Lock className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Official Information
        </h2>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">
          Read-only (Admin only)
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Employee ID
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.employee_id || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Full Legal Name
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.name}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Department & Branch
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.department || "N/A"}
            </p>
            <p className="text-xs text-slate-500">{profile.branch || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Date of Birth
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString()
                : "N/A"}
              {profile.age ? ` (${profile.age} yrs)` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Gender
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.gender || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nationality
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.nationality || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
