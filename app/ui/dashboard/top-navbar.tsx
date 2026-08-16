import { Search, Bell } from "lucide-react";
import { UserDropdown } from "./user-dropdown";

interface TopNavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    image_url: string | null;
  };
}

export function TopNavbar({ user }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full  border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm backdrop-blur-md bg-white">
   
      <div className="flex flex-col text-left">
        <h2 className="text-base font-bold text-slate-900 leading-tight tracking-tight">
          {user.role === "admin" ? "Dashboard" : "Workspace"}
        </h2>
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
          {user.role === "admin"
            ? "Workforce overview and pending approvals at a glance"
            : "Your operational dashboard shell updates"}
        </p>
      </div>

      {/* Center Column: Global Unified Search Input with Command Keyboard Helper */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#009473] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search employees, requests, documents..."
            className="w-full pl-9 pr-14 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:border-[#009473] focus:ring-2 focus:ring-[#eaf8f5] transition-all"
          />
        </div>
      </div>

      {/* Right Column: Alerts & User Subsystem Action Anchors */}
      <div className="flex items-center gap-4 ml-auto md:ml-0">
        {/* Alerts Notification Container */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white border-2 border-white ring-1 ring-rose-100 shadow-sm animate-pulse">
            3
          </span>
        </button>

        {/* Separator Pipe Accent */}
        <div className="h-6 w-px bg-slate-100 hidden sm:block" />

        {/* Modular Profile Action Trigger */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
