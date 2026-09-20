import { auth } from "@/auth";
import NavLinks from "./nav-links";
import { WorkspaceToggle } from "./workSpace-toggle";
import { handleSignOut } from "@/app/lib/employeeDashboard/employee/auth-actions";
import { Building2, LogOut } from "lucide-react"; 
import { verifyFeatureAccess } from "@/app/lib/employeeDashboard/employee/auth-actions";

export default async function SideNav() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // 👇 FIXED: Check specific features individually
  const canViewDashboard = await verifyFeatureAccess(
    session.user.id,
    "view_dashboard",
  );
  const canViewDirectory = await verifyFeatureAccess(
    session.user.id,
    "view_directory",
  );
  const canManageTime = await verifyFeatureAccess(
    session.user.id,
    "approve_leaves",
  );
  const canManagePerf = await verifyFeatureAccess(
    session.user.id,
    "start_reviews",
  );
  const isSuperAdmin = await verifyFeatureAccess(
    session.user.id,
    "manage_system",
  );

  return (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-100 p-4 w-full">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-50 pb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#009473] text-white shadow-sm shadow-emerald-800/10 shrink-0">
            <Building2 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="text-left leading-tight">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Comp
            </h2>
            <p className="text-xs font-medium text-slate-400">
              HR Operations Suite
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-3">
            {canViewDashboard ? "Management" : "Workspace"}
          </span>
          <nav className="space-y-1">
            {/* 👇 FIXED: Pass the granular permissions object */}
            <NavLinks
              permissions={{
                dashboard: canViewDashboard,
                directory: canViewDirectory,
                attendance: canManageTime,
                performance: canManagePerf,
                adminOnly: isSuperAdmin,
              }}
            />
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 space-y-3 flex flex-col">
        {/* Pass the baseline dashboard access to the toggle */}
        <WorkspaceToggle
          isAdmin={isSuperAdmin}
          isManager={canViewDashboard}
          hasEmployeeView={true}
        />

        <form action={handleSignOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors stroke-2" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
