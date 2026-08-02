// app/(employee)/my-profile/(overview)/page.tsx
import { auth } from "@/auth";
import { getProfileData } from "@/app/lib/employeeDashboard/employee/data";
import { redirect } from "next/navigation";
import ProfileHeader from "@/app/ui/employee/profile/profileHeader";
import ProfileTabs from "@/app/ui/employee/profile/tabs/profileTabs";
import {
  ProfileFormSkeleton,
  ProfileHeaderSkeleton,
} from "@/app/ui/employee/skeleton";
import { Suspense } from "react";
import { getEducationData } from "@/app/lib/employee/profile/data";

export default async function EmployeeProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const profile = await getProfileData(session.user.email);

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-500">
        Employee profile not found.
      </div>
    );
  }

  const educationHistory = await getEducationData(profile.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      {/* Header section remains intact */}
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader profile={profile} />
      </Suspense>

      {/* Pass educationHistory down to ProfileTabs */}
      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileTabs
          profile={profile}
          userEmail={session.user.email}
          educationHistory={educationHistory}
        />
      </Suspense>
    </div>
  );
}
