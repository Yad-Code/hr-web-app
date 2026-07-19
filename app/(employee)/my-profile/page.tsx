import { auth } from "@/auth";
import { Edit2, LogOut } from "lucide-react";

export default async function EmployeeProfilePage() {
  const session = await auth();

  // Profile data mapped naturally from our stack configurations
  const profile = {
    name: session?.user?.name || "Yad Developer",
    initials: "YD",
    role: "Employee",
    title: "Software Engineer",
    department: "Engineering",
    status: "Active",
    bio: "Full-stack software engineer specializing in robust web architectures, component routing, state management, and relational database APIs. Focused on building high-performance workspace tooling.",
    skills: ["React", "Next.js", "Node.js", "Express", "SQL", "Computer Architecture"],
    metrics: [
      {
        label: "DAYS AT COMPANY",
        value: "180",
        subtext: "Since Jan 2026",
      },
      {
        label: "ATTENDANCE",
        value: "98.4%",
        subtext: "this month",
      },
      {
        label: "PTO REMAINING",
        value: "15 days",
        subtext: "of 20 allocated",
      },
      {
        label: "PENDING REVIEWS",
        value: "0",
        subtext: "Q2 2026 cycle",
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none animate-fadeIn">
      
      {/* --- MASTER PROFILE HEADER CARD --- */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Deep Blue Banner with Subtle Grid Overlay Layout */}
        <div className="h-32 sm:h-40 w-full bg-[#1A1F3D] relative">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* Identity Details Content Block */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col">
          
          {/* Overflowing Circular Avatar Section */}
          <div className="absolute -top-12 sm:-top-16 left-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center border-4 border-white shadow-md">
              {profile.initials}
            </div>
          </div>

          {/* Core Row: Identity Text Blocks and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-16 sm:pt-14">
            
            {/* Identity Text Context Labels */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-100">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {profile.title} · <span className="text-slate-400">{profile.department}</span>
              </p>
            </div>

            {/* Right Group: Status Indicator and Profile Interactions */}
            <div className="flex items-center gap-2.5 self-start lg:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {profile.status}
              </span>
              
              <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-98">
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                Edit profile
              </button>

              <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-rose-600 bg-rose-50/50 border border-rose-100/60 rounded-xl hover:bg-rose-50 transition-all active:scale-98">
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                Sign out
              </button>
            </div>
          </div>

          {/* Description Biography Block */}
          <div className="mt-6 max-w-3xl">
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* Reusable Technology/Skill Badges Row */}
          <div className="flex flex-wrap gap-2 mt-5">
            {profile.skills.map((skill) => (
              <span 
                key={skill} 
                className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-full text-xs font-bold shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* --- CORE WORKSPACE SYSTEM METRIC CARDS GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {profile.metrics.map((metric) => (
          <div 
            key={metric.label} 
            className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md/40 transition-shadow duration-200"
          >
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {metric.label}
            </span>
            <div className="space-y-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
                {metric.value}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">
                {metric.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}