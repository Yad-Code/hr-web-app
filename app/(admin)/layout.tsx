import SideNav from "../ui/dashboard/sidnav";
import { TopNavbar } from "@/app/ui/dashboard/top-navbar";
import { auth } from "@/auth"; // 👈 Hook securely into Auth.js session state
import { PresenceHeartbeat } from "@/app/providers/PresenceHeartbeat";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the active admin session server-side
  const session = await auth();

  // 2. Map administrative parameters directly from the token payload
  const currentUser = {
    name: session?.user?.name || "Admin User",
    email: session?.user?.email || "admin@company.com",
    role: session?.user?.role || "admin",
    image_url: session?.user?.image || null, // Triggers custom initials fallback badge
  };

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/50">
      {session?.user?.id && <PresenceHeartbeat userId={session.user.id} />}
      {/* 3. Side Navigation Panel (Passed with "admin" context configuration) */}
      <div className="w-full flex-none md:w-64">
        <SideNav role="admin" />
      </div>

      {/* 4. Main Administrative Command Center Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Interactive Top Navbar with active Admin user profile */}
        <TopNavbar user={currentUser} />

        {/* Dynamic page contents pane rendered with proper workspace padding */}
        <div className="grow p-6 md:overflow-y-auto md:p-12 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
