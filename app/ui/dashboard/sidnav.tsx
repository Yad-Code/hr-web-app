import NavLinks from "./nav-links";
import { Building2 } from "lucide-react";
import { auth } from "@/app/auth"; // 👈 Pull sessions securely for the footer badge

interface SideNavProps {
  role: 'admin' | 'employee'; // 👈 Fixed: Type was incorrectly set to 'employee' | 'employee'
}

export default async function SideNav({ role }: SideNavProps) {
  // 1. Fetch the active user session server-side for the avatar badge
  const session = await auth();
  
  // Extract the first letter of the user's name as a dynamic fallback initial
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-100 p-4 w-full">
      <div className="space-y-6">
        {/* Header App Identity Banner */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-50 pb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#009473] text-white shadow-sm shadow-emerald-800/10 flex-shrink-0">
            <Building2 className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="text-left leading-tight">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Razga</h2>
            <p className="text-xs font-medium text-slate-400">HR Operations Suite</p>
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

      {/* Bottom Profile Anchor / Footer Context */}
      <div className="pt-4 px-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold tracking-wide border border-slate-700 shadow-inner select-none cursor-pointer hover:bg-slate-700 transition-colors">
          {userInitial} {/* 👈 Dynamic initial letter based on logged-in user */}
        </div>
      </div>
    </div>
  );
}