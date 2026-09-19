// @/app/(employee)/my-profile/(overview)/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import ProfileHeader from "@/app/ui/employee/profile/profileHeader";
import ProfileTabs from "@/app/ui/employee/profile/tabs/profileTabs";
import {
  ProfileFormSkeleton,
  ProfileHeaderSkeleton,
} from "@/app/ui/employee/skeleton";

import {
  getEducationData,
  getLanguageData,
  getEmployeeDocumentsData,
} from "@/app/lib/employee/profile/data"; 
import { getProfileById } from "@/app/lib/employeeList/data";

export default async function EmployeeProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }
 
  const profile = await getProfileById(session.user.id);

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-500">
        Employee profile not found.
      </div>
    );
  }

  const [educationHistory, languageHistory, documents] = await Promise.all([
    getEducationData(profile.id),
    getLanguageData(profile.id),
    getEmployeeDocumentsData(profile.id),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader profile={profile} />
      </Suspense>

      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileTabs
          profile={profile}
          userEmail={session.user.email as string}
          educationHistory={educationHistory}
          languageHistory={languageHistory}
          documents={documents}
        />
      </Suspense>
    </div>
  );
}
