// @/app/ui/employee/profile/officialInfoCard.tsx

import {
  Lock,
  User,
  Globe,
  Calendar,
  Briefcase,
  Shield,
  Heart,
  Droplet,
  MapPin,
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

export default function OfficialInfoCard({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
  return (
    <div className="h-full flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs transition-all hover:shadow-sm">
      <div className="space-y-5">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
              Official & General Details
            </h2>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-slate-500 bg-slate-100/90 border border-slate-200/50 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Read-only
          </span>
        </div>

        {/* Responsive Grid of Data */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <InfoItem
            label="Employee ID"
            value={profile.employee_id || "N/A"}
            icon={Briefcase}
          />
          <InfoItem label="Full Legal Name" value={profile.name} icon={User} />
          <InfoItem
            label="Department & Branch"
            value={profile.department || "N/A"}
            subValue={profile.branch ? `Branch: ${profile.branch}` : undefined}
            icon={Briefcase}
          />
          <InfoItem
            label="Date of Birth"
            value={
              profile.date_of_birth
                ? `${new Date(profile.date_of_birth).toLocaleDateString()}${
                    profile.age ? ` (${profile.age} yrs)` : ""
                  }`
                : "N/A"
            }
            icon={Calendar}
          />
          <InfoItem
            label="Gender"
            value={profile.gender || "N/A"}
            icon={User}
          />
          <InfoItem
            label="Nationality"
            value={profile.nationality || "N/A"}
            icon={Globe}
          />
          <InfoItem
            label="Marital Status"
            value={profile.marital_status || "Single"}
            icon={Heart}
          />
          <InfoItem
            label="Blood Group"
            value={profile.blood_group || "Unknown"}
            icon={Droplet}
          />
          <div className="xs:col-span-2 sm:col-span-2">
            <InfoItem
              label="Current Address"
              value={profile.current_address || "Not specified"}
              icon={MapPin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Responsive Read-only Box
function InfoItem({
  label,
  value,
  subValue,
  icon: Icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
        <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl px-3 py-2 sm:py-2.5 transition-colors hover:border-slate-300/80">
        <p className="text-sm font-semibold text-slate-800 break-words leading-snug">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-slate-500 mt-0.5 break-words font-normal">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}
