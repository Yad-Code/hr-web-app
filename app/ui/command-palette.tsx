"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  CalendarClock,
  User,
  LogOut,
  FilePlus,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K globally
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <Command className="flex flex-col w-full h-full" loop>
          <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="w-full h-14 px-4 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-500 uppercase">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto p-2 scroll-smooth">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-bold text-slate-400 uppercase tracking-wider p-2">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/attendance"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors"
              >
                <CalendarClock className="w-4 h-4" />
                My Attendance
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/my-profile"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

            <Command.Group heading="Quick Actions" className="text-xs font-bold text-slate-400 uppercase tracking-wider p-2">
              <Command.Item
                onSelect={() => runCommand(() => alert("Will trigger Leave Modal!"))}
                className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-emerald-50 aria-selected:text-emerald-700 transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                Request Time Off
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/api/auth/signout"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-rose-50 aria-selected:text-rose-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}