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
  Users,
} from "lucide-react";
import { getGlobalSearchData } from "@/app/lib/search/actions";
import Image from "next/image";

interface SearchEmployee {
  id: string;
  name: string;
  department: string;
  image_url: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<SearchEmployee[]>([]);
  const router = useRouter();

  useEffect(() => {
    getGlobalSearchData().then((res) => {
      if (res.success) setEmployees(res.employees);
    });

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.key === "Escape") {
        setOpen(false);
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
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <Command className="flex flex-col w-full h-full" loop>
          <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search commands, team members, or actions..."
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

            <Command.Group
              heading="Navigation"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider p-2"
            >
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(() => router.push("/dashboard/attendance"))
                }
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors"
              >
                <CalendarClock className="w-4 h-4" />
                My Attendance
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

            {employees.length > 0 && (
              <Command.Group
                heading="Team Directory"
                className="text-xs font-bold text-slate-400 uppercase tracking-wider p-2"
              >
                {employees.map((emp) => (
                  <Command.Item
                    key={emp.id}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/dashboard/directory/${emp.id}`),
                      )
                    }
                    className="flex items-center justify-between gap-3 px-3 py-2 mt-1 rounded-xl cursor-pointer aria-selected:bg-slate-50 dark:aria-selected:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {emp.image_url ? (
                        <Image
                          src={emp.image_url}
                          alt={emp.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover w-6 h-6 border border-slate-200"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {emp.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {emp.department}
                        </p>
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

            <Command.Group
              heading="Quick Actions"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider p-2"
            >
              <Command.Item
                onSelect={() =>
                  runCommand(() => router.push("/my-profile?action=leave"))
                }
                className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-emerald-50 aria-selected:text-emerald-700 transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                Request Time Off
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(() => router.push("/api/auth/signout"))
                }
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
