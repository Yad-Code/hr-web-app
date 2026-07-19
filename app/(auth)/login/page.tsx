import { Building2, KeyRound } from "lucide-react";
import LoginForm from "@/app/ui/login/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B0F17] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Background Grid Accent Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-[440px] z-10 flex flex-col items-center">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#00B894] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00B894]/20 ring-4 ring-[#00B894]/10 mb-4 transition-transform hover:scale-105 duration-300">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Razga</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Sign in to your workspace</p>
        </div>

        {/* --- SANDBOX TESTING CREDENTIALS ACCORDION BANNER --- */}
        <div className="w-full mb-5 bg-[#1A2232]/50 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-[#00B894]" />
            <span>Test</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div className="flex justify-between items-center bg-[#0B0F17]/40 p-1.5 px-2.5 rounded-lg border border-slate-800/40">
              <span className="text-emerald-400 font-semibold">Admin:</span>
              <span>admin@company.com</span>
              <span className="text-slate-500">AdminPass123</span>
            </div>
            <div className="flex justify-between items-center bg-[#0B0F17]/40 p-1.5 px-2.5 rounded-lg border border-slate-800/40">
              <span className="text-blue-400 font-semibold">Employee:</span>
              <span>yad@company.com</span>
              <span className="text-slate-500">EmployeePass123</span>
            </div>
            <div className="flex justify-between items-center bg-[#0B0F17]/40 p-1.5 px-2.5 rounded-lg border border-slate-800/40">
              <span className="text-blue-400 font-semibold">Employee:</span>
              <span>lana@company.com</span>
              <span className="text-slate-500">EmployeePass123</span>
            </div>
          </div>
        </div>
        {/* -------------------------------------------------- */}

        {/* Primary Form Wrapper Card */}
        <div className="w-full bg-[#131924]/80 border border-slate-800/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          <LoginForm />
        </div>

        {/* Separator Section Context */}
        <div className="w-full flex items-center justify-center my-6 space-x-4">
          <div className="h-px bg-slate-800 flex-1 opacity-60" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
          <div className="h-px bg-slate-800 flex-1 opacity-60" />
        </div>

        {/* OAuth Provider Section - Continue with Google */}
        <button
          type="button"
          className="w-full bg-[#131924]/40 hover:bg-[#131924]/80 border border-slate-800 text-slate-200 hover:text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.99]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" strokeLinecap="round"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <footer className="mt-8 text-[11px] font-medium text-slate-600 tracking-wide">
          Protected by Razga Security · <a href="#" className="hover:underline transition-all hover:text-slate-500">Privacy policy</a>
        </footer>

      </div>
    </div>
  );
}