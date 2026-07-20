import { handleSignOut } from "@/app/lib/auth-actions";
import { LogOut } from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/definitions";

export default function ProfileHeader({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="h-24 sm:h-32 w-full bg-[#1A1F3D] relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="px-6 pb-6 pt-0 relative">
        <div className="absolute -top-12 left-6">
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-indigo-500 to-blue-600 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md">
            {(profile.preferred_name || profile.name || "U").charAt(0)}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-14">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {profile.preferred_name || profile.name}
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-100">
                {profile.role || "Employee"}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider border border-blue-100">
                {profile.status || "Active"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {profile.name} · {profile.department || "General"}
            </p>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-rose-600 bg-rose-50/50 border border-rose-100/60 rounded-xl hover:bg-rose-50 transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
