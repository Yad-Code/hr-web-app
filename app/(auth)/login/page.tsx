"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

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

      {/* Main Container Core Stack */}
      <div className="w-full max-w-[440px] z-10 flex flex-col items-center">
        
        {/* App Logo & Header Header Shell */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#00B894] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00B894]/20 ring-4 ring-[#00B894]/10 mb-4 transition-transform hover:scale-105 duration-300">
            {/* Using Building2 from Lucide to mimic the workplace/HR theme */}
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Razga</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Sign in to your workspace</p>
        </div>

        {/* Primary Form Wrapper Card */}
        <div className="w-full bg-[#131924]/80 border border-slate-800/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            
            {/* Email Field Layout Column */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 tracking-wide">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-[#00B894] transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="you@razga.com"
                  className="w-full pl-11 pr-4 py-3 text-sm font-medium text-white bg-[#1A2232] border border-slate-800 rounded-xl placeholder-slate-600 focus:outline-none focus:border-[#00B894] focus:ring-2 focus:ring-[#00B894]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field Layout Column */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 tracking-wide">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-[#00B894] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 text-sm font-medium text-white bg-[#1A2232] border border-slate-800 rounded-xl placeholder-slate-600 focus:outline-none focus:border-[#00B894] focus:ring-2 focus:ring-[#00B894]/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password Toolbar Link Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-3 cursor-pointer select-none group">
                {/* Custom Toggle Switch Component */}
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={keepSignedIn}
                    onChange={() => setKeepSignedIn(!keepSignedIn)}
                    className="sr-only" 
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${keepSignedIn ? 'bg-[#00B894]' : 'bg-slate-700'}`} />
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${keepSignedIn ? 'transform translate-x-4' : ''}`} />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">Keep me signed in</span>
              </label>

              <a href="#" className="text-xs font-bold text-[#00B894] hover:text-[#00cfa5] hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Main Action Submit Button Control */}
            <button
              type="submit"
              className="w-full bg-[#00B894] hover:bg-[#00cfa5] active:scale-[0.99] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#00B894]/10 transition-all duration-200 mt-2 group"
            >
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

          </form>
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
          {/* SVG Google Custom Minimalist Monochromatic Vector Glyph */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" strokeLinecap="round"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        {/* Simple Legal/Contextual Footer Elements */}
        <footer className="mt-8 text-[11px] font-medium text-slate-600 tracking-wide">
          Protected by Razga Security · <a href="#" className="hover:underline transition-all hover:text-slate-500">Privacy policy</a>
        </footer>

      </div>
    </div>
  );
}