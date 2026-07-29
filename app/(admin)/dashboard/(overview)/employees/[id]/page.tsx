// app/admin/employees/[id]/page.tsx
import { auth } from "@/auth";
import {
  getProfileById,
  getCurrentUserRole,
} from "@/app/lib/employeeDashboard/employee/data";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ProfileHeader from "@/app/ui/employee/profile/profileHeader";
import OfficialInfoCard from "@/app/ui/employee/profile/officialInfoCard";
import ProfileForm from "@/app/ui/employee/profile/profileForm";
import {
  OfficialInfoCardSkeleton,
  ProfileFormSkeleton,
  ProfileHeaderSkeleton,
} from "@/app/ui/employee/skeleton";
import { Suspense } from "react";

export default async function AdminEmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  // 1. Auth check
  if (!session?.user) {
    redirect("/login");
  }

  // 2. Admin role check
  const role = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/employee/profile");
  }

  // 3. Resolve the route ID
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      {/* Admin Back Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/employees"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Back to Team Presence
        </Link>
        <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
          Admin Editing Mode
        </span>
      </div>

      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader profile={profile} />
      </Suspense>

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
