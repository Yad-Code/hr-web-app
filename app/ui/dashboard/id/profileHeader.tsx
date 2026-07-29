// @/app/ui/dashboard/id/profileHeader.tsx

import Image from "next/image";

interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string;
    email: string;
    role?: string;
    status?: string;
    image_url?: string;
  };
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.name,
  )}&background=f1f5f9&color=64748b`;
  const isActive = profile.status?.toLowerCase() === "active";

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5 text-left">
      <div className="relative w-20 h-20 rounded-full shrink-0 overflow-hidden bg-slate-100 ring-4 ring-slate-50">
        <Image
          src={profile.image_url || fallbackAvatar}
          alt={profile.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 space-y-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
              profile.role?.toLowerCase() === "admin"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {profile.role || "Employee"}
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium">{profile.email}</p>

        <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {isActive ? "Active Account" : "Offline / Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}
