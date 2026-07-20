// app/employee/profile/page.tsx
import { auth } from "@/auth";
import { getProfileData } from "@/app/lib/data";
import { redirect } from "next/navigation";
import ProfileHeader from "@/app/ui/employee/profile/profileHeader";
import OfficialInfoCard from "@/app/ui/employee/profile/officialInfoCard";
import ProfileForm from "@/app/ui/employee/profile/profileForm";

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      <ProfileHeader profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfficialInfoCard profile={profile} />
        <ProfileForm profile={profile} userEmail={session.user.email} />
      </div>
    </div>
  );
}