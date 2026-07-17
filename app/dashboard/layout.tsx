import SideNav from "../ui/dashboard/sidnav";
import { getCurrentUserRole } from "@/app/lib/data";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // 1. Fetch the user role server-side securely
  const role = await getCurrentUserRole();

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/50">
      {/* 2. Pass the role straight to your new sidebar layout */}
      <div className="w-full flex-none md:w-64">
        <SideNav role={role} />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12 bg-white">
        {children}
      </div>
    </div>
  );
}