import NavLinks from "./nav-links";
import { Building2, LogOut } from "lucide-react";
import { handleSignOut } from "@/app/lib/employeeDashboard/employee/auth-actions";

interface SideNavProps {
  role: "admin" | "employee";
}

export default async function SideNav({ role }: SideNavProps) {
  return (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-100 p-4 w-full">
      <div className="space-y-6">
        {/* Header App Identity Banner */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-50 pb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#009473] text-white shadow-sm shadow-emerald-800/10 shrink-0">
            <Building2 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="text-left leading-tight">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Razga
            </h2>
            <p className="text-xs font-medium text-slate-400">
              HR Operations Suite
            </p>
          </div>
        </div>

        {/* Content Navigation Block */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-3">
            {role === "admin" ? "Management" : "Workspace"}
          </span>
          <nav className="space-y-1">
            <NavLinks role={role} />
          </nav>
        </div>
      </div>

      {/* Profile & Server-Side Sign Out Action Block */}
      <div className="pt-4 border-t border-slate-50 space-y-3">
        <form
          action={handleSignOut}
        >
          <button
            type="submit"
            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors stroke-2" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
