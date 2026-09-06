// @/app/(admin)/layout.tsx

import SideNav from "../ui/dashboard/sidnav";
import { TopNavbar } from "@/app/ui/dashboard/top-navbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PresenceHeartbeat } from "@/app/providers/PresenceHeartbeat";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = {
    id: session.user.id as string,  
    name: session.user.name as string,
    email: session.user.email as string,
    role: session.user.role as "admin" | "manager" | "employee",
    image_url: session.user.image || null,
  };

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/50">
      {session.user.id && (
        <PresenceHeartbeat userId={session.user.id as string} />
      )}

      <div className="w-full flex-none md:w-64">
        <SideNav role={currentUser.role} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar user={currentUser} />

        <div className="grow p-6 md:overflow-y-auto md:p-12 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
