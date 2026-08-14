import { auth } from "@/auth";
import { getProfileById } from "@/app/lib/employeeList/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import ProfileHeader from "@/app/ui/dashboard/id/profileHeader";
import AdminProfileTabs from "@/app/ui/dashboard/id/tabs/adminProfileTabs";
import {
  ProfileFormSkeleton,
  ProfileHeaderSkeleton,
} from "@/app/ui/employee/skeleton";

import {
  getEducationData,
  getLanguageData,
  getEmployeeDocumentsData,
} from "@/app/lib/employee/profile/data";
import { getEmployeeSelfAssessment } from "@/app/lib/admin/performance/data";
import { getEmployeeSkills } from "@/app/lib/admin/profile/skills/data";

export default async function AdminEmployeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/my-profile");
  }

  const { id } = await params;
  const profile = await getProfileById(id);

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

  // 2. Determine the current review cycle (you might make this dynamic later)
  const currentCycle = "Q3 2026";

  // 3. Add the assessment fetch to your parallel Promise.all array
  const [educationHistory, languageHistory, documents, assessment, skills] =
    await Promise.all([
      getEducationData(profile.id),
      getLanguageData(profile.id),
      getEmployeeDocumentsData(profile.id),
      getEmployeeSelfAssessment(profile.id, currentCycle),
      getEmployeeSkills(profile.id),
    ]);

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

      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader profile={profile} />
      </Suspense>

      <Suspense fallback={<ProfileFormSkeleton />}>
        <AdminProfileTabs
          profile={profile}
          educationHistory={educationHistory}
          languageHistory={languageHistory}
          documents={documents}
          assessment={assessment}
          skills={skills}
        />
      </Suspense>
    </div>
  );
}
