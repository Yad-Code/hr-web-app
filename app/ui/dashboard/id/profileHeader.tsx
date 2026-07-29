// @/app/ui/dashboard/id/profileHeader.tsx
"use client";

import { useTransition, useRef } from "react";
import Image from "next/image";
import { uploadProfilePicture } from "@/app/lib/employeeList/actions";
import { Camera, Loader2, ShieldAlert } from "lucide-react";

interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string;
    email: string;
    role?: string;
    status?: string;
    image_url?: string | null;
    department?: string;
    preferred_name?: string;
  };
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("employeeId", profile.id);

    startTransition(async () => {
      const result = await uploadProfilePicture(formData);
      if (!result?.success) {
        alert(result?.error || "Failed to update profile picture.");
      }
    });
  };

  const displayName = profile.preferred_name || profile.name;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const isAdmin = profile.role?.toLowerCase() === "admin";

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Admin-Styled Banner Background */}
      <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-white text-[11px] font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Admin Profile Management</span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar Container with Upload Overlay */}
        <div className="absolute -top-12 left-6 group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden relative">
            {profile.image_url ? (
              <Image
                src={profile.image_url}
                alt={displayName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span>{initial}</span>
            )}

            {/* Hover Camera Overlay & Loading State */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Change</span>
                </>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-14">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {displayName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isAdmin
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {profile.role || "Employee"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  profile.status?.toLowerCase() === "active"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {profile.status || "Active"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              {profile.email}{" "}
              {profile.department ? `· ${profile.department}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
