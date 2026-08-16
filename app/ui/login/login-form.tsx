"use client";

import { useActionState, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { authenticate } from "@/app/lib/employeeDashboard/employee/auth-actions";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  return (
    <form action={formAction} className="space-y-5">
      {/* Error Notification Block */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
 
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 tracking-wide">Email address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-[#00B894] transition-colors" />
          </div>
          <input
            type="email"
            name="email"
            required
            disabled={isPending}
            placeholder="you@company.com"
            className="w-full pl-11 pr-4 py-3 text-sm font-medium text-white bg-[#1A2232] border border-slate-800 rounded-xl placeholder-slate-600 focus:outline-none focus:border-[#00B894] focus:ring-2 focus:ring-[#00B894]/10 transition-all duration-200 disabled:opacity-50"
          />
        </div>
      </div>
 
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 tracking-wide">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-[#00B894] transition-colors" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            disabled={isPending}
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 text-sm font-medium text-white bg-[#1A2232] border border-slate-800 rounded-xl placeholder-slate-600 focus:outline-none focus:border-[#00B894] focus:ring-2 focus:ring-[#00B894]/10 transition-all duration-200 disabled:opacity-50"
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
 
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center space-x-3 cursor-pointer select-none group">
          <div className="relative">
            <input 
              type="checkbox" 
              name="keepSignedIn"
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
 
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#00B894] hover:bg-[#00cfa5] active:scale-[0.99] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#00B894]/10 transition-all duration-200 mt-2 group disabled:opacity-50 disabled:pointer-events-none"
      >
        {isPending ? "Signing in..." : "Sign in"}
        {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
      </button>
    </form>
  );
}