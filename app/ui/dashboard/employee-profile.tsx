import { User, Mail, Shield, ShieldAlert, Building2, CalendarDays } from "lucide-react";

interface EmployeeProfileProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function EmployeeProfile({ user }: EmployeeProfileProps) {
  return (
    <div className="max-w-2xl mx-auto w-full text-left space-y-6 animate-fadeIn">
      {/* Profile Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Building2 className="w-40 h-40" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[#00B894] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white/20">
            {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{user.name}</h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Workspace Session
            </p>
          </div>
        </div>
      </div>

      {/* Account Details Form Card */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-50 pb-3">
          Account Identification
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {user.name}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user.email}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Role</span>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
              {user.role === "admin" ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-[#00B894]" />
              )}
              <span className="capitalize">{user.role}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department Assignment</span>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              {user.role === "admin" ? "People Operations" : "Engineering Team"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}