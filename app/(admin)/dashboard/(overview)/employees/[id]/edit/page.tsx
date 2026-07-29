import { auth } from "@/auth";
import { getProfileById } from "@/app/lib/employeeList/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import ProfileHeader from "@/app/ui/dashboard/id/profileHeader";
import OfficialInfoCard from "@/app/ui/dashboard/id/officialInfoCard";
import ProfileForm from "@/app/ui/dashboard/id/profileForm";
import {
  OfficialInfoCardSkeleton,
  ProfileFormSkeleton,
  ProfileHeaderSkeleton,
} from "@/app/ui/employee/skeleton";

export default async function AdminEmployeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Redirect to /my-profile if the user is not an admin
  const session = await auth(); 
  if (session?.user?.role !== "admin") {
    redirect("/my-profile");
  }

  // 2. Resolve dynamic [id] parameter
  const { id } = await params;

  // 3. Fetch employee profile directly from database
  const profile = await getProfileById(id);

  // 4. Render error card if record doesn't exist
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <h2 className="text-lg font-bold text-rose-800">
          Employee Profile Not Found
        </h2>
        <p className="text-xs text-rose-600 font-mono">
          No employee record exists in the database for ID:{" "}
          <span className="underline">{id}</span>
        </p>
        <Link
          href="/dashboard/employees"
          className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-all shadow-xs"
        >
          ← Return to Team Presence
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      {/* Admin Navigation Banner */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shadow-xs">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to Team Presence
        </Link>
        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full">
          Admin Editing Mode
        </span>
      </div>

      {/* Header Profile Section */}
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader profile={profile} />
      </Suspense>

      {/* Official Info & Edit Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<OfficialInfoCardSkeleton />}>
          <OfficialInfoCard profile={profile} />
        </Suspense>
        <Suspense fallback={<ProfileFormSkeleton />}>
          <ProfileForm profile={profile} userEmail={profile.email} />
        </Suspense>
      </div>
    </div>
  );
}
