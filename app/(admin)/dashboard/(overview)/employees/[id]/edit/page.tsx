import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAccess } from "@/app/lib/auth/access-control";
import {
  getProfileById,
  getManagersDropdown,
} from "@/app/lib/employeeList/data";
import {
  getEducationData,
  getLanguageData,
  getEmployeeDocumentsData,
} from "@/app/lib/employee/profile/data";
import { getEmployeeSelfAssessment } from "@/app/lib/admin/performance/data";
import { getEmployeeSkills } from "@/app/lib/admin/profile/skills/data";

import ProfileHeader from "@/app/ui/dashboard/id/profileHeader";
import AdminProfileTabs from "@/app/ui/dashboard/id/tabs/adminProfileTabs";
import {
  ProfileFormSkeleton,
  ProfileHeaderSkeleton,
} from "@/app/ui/employee/skeleton";

export default async function AdminEmployeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const actorId = session.user.id;
  const { id: targetId } = await params;
 
  const requiredAction =
    actorId === targetId ? "edit_personal_profile" : "update_records";
  const isAuthorized = await verifyAccess(actorId, requiredAction, targetId);

  if (!isAuthorized) redirect("/my-profile");
 
  const canUpdateOfficialRecords = await verifyAccess(
    actorId,
    "update_records",
    targetId,
  );
  const canManagePermissions = await verifyAccess(
    actorId,
    "manage_system_access",
    targetId,
  );

  const profile = await getProfileById(targetId);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <h2 className="text-lg font-bold text-rose-800">
          Employee Profile Not Found
        </h2>
        <p className="text-xs text-rose-600 font-mono">
          No employee record exists for ID:{" "}
          <span className="underline">{targetId}</span>
        </p>
        <Link
          href="/dashboard/employees"
          className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-all shadow-xs"
        >
          ← Return to Directory
        </Link>
      </div>
    );
  }

  const today = new Date();
  const currentCycle = `Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`;

  const managersList = await getManagersDropdown(actorId);

  const educationHistory = await getEducationData(profile.id);
  const languageHistory = await getLanguageData(profile.id);
  const documents = await getEmployeeDocumentsData(profile.id);
  const assessment = await getEmployeeSelfAssessment(profile.id, currentCycle);
  const skills = await getEmployeeSkills(profile.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shadow-xs">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to Directory
        </Link>
        <span
          className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${canUpdateOfficialRecords ? "bg-indigo-100 text-indigo-800 border border-indigo-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}
        >
          {canUpdateOfficialRecords
            ? "Authorized Edit Mode"
            : "Personal Edit Mode"}
        </span>
      </div>

      <Suspense fallback={<ProfileHeaderSkeleton />}>
        {/* Pass the ABAC flag to dynamically render the Admin Banner */}
        <ProfileHeader
          profile={profile}
          canUpdateOfficialRecords={canUpdateOfficialRecords}
        />
      </Suspense>

      <Suspense fallback={<ProfileFormSkeleton />}>
        <AdminProfileTabs
          profile={profile}
          educationHistory={educationHistory}
          languageHistory={languageHistory}
          documents={documents}
          assessment={assessment}
          skills={skills}
          managersList={managersList}
          canUpdateOfficialRecords={canUpdateOfficialRecords}
          canManagePermissions={canManagePermissions}
        />
      </Suspense>
    </div>
  );
}
