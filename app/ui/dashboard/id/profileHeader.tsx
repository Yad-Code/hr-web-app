// @/app/ui/dashboard/id/profileHeader.tsx
"use client";

import { useTransition, useRef } from "react";
import Image from "next/image";
import { uploadProfilePicture } from "@/app/lib/employeeList/actions";  
import { Camera, Loader2 } from "lucide-react";

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
    // Ensure the server action knows WHICH employee to update
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

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      {/* Banner Background */}
      <div className="h-24 sm:h-32 w-full bg-[#1A1F3D] relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar Container with Upload Overlay */}
        <div className="absolute -top-12 left-6 group">
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-indigo-500 to-blue-600 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden relative">
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
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer disabled:cursor-not-allowed"
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

          {/* Hidden File Input */}
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
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                  profile.role?.toLowerCase() === "admin"
                    ? "bg-rose-50 text-rose-700 border-rose-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}
              >
                {profile.role || "Employee"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                  profile.status?.toLowerCase() === "active"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
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
