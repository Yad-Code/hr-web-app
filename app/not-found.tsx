// @/app/not-found.tsx
import Link from "next/link";
import { FileQuestion, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50 text-center animate-fadeIn">
      <div className="w-20 h-20 bg-white text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
        <FileQuestion className="w-10 h-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
        We couldn&apos;t find the page you were looking for. It might have been
        removed, renamed, or you may not have the required access permissions.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* 👇 Server Action to destroy the session and redirect */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-rose-600 transition-all shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out & Return
          </button>
        </form>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-xs"
        >
          <LayoutDashboard className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
