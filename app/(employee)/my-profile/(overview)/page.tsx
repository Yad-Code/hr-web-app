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
import {
  getEducationData,
  getLanguageData,
  getEmployeeDocumentsData,
} from "@/app/lib/employee/profile/data";

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

  // Fetch all secondary data in parallel for optimal render speed
  const [educationHistory, languageHistory, documents] = await Promise.all([
    getEducationData(profile.id),
    getLanguageData(profile.id),
    getEmployeeDocumentsData(profile.id),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      {/* Header section */}
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader profile={profile} />
      </Suspense>

      {/* Pass profile details & relations down to ProfileTabs */}
      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileTabs
          profile={profile}
          userEmail={session.user.email}
          educationHistory={educationHistory}
          languageHistory={languageHistory}
          documents={documents}
        />
      </Suspense>
    </div>
  );
}
