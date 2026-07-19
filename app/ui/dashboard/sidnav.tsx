import NavLinks from "./nav-links";
import { Building2, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";

interface SideNavProps {
  role: 'admin' | 'employee';
}

export default async function SideNav({ role }: SideNavProps) {
  const session = await auth();
  
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";
  const userImage = session?.user?.image;

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

      {/* Profile & Server-Side Sign Out Action Block */}
      <div className="pt-4 border-t border-slate-50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          {userImage ? (
            <img 
              src={userImage} 
              alt={session?.user?.name || "Profile"} 
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-slate-200 text-xs font-bold tracking-wide select-none">
              {userInitial}
            </div>
          )}
          
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 truncate">
              {session?.user?.name || "Active Session"}
            </span>
            <span className="text-[10px] font-medium text-slate-400 capitalize">
              {role}
            </span>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors stroke-[2]" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}