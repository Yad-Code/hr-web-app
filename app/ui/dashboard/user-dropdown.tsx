"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { handleSignOut } from "@/app/lib/employee/auth-actions";
import Link from "next/link";
// Import from the react sub-module if using NextAuth

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    role: string;
    image_url: string | null;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Client side handler execution

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-left p-1.5 hover:bg-slate-50 rounded-xl transition-colors duration-200 active:scale-98 focus:outline-none"
      >
        {user.image_url ? (
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200">
            <Image
              src={user.image_url}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#009473] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
            {initials}
          </div>
        )}
        <div className="hidden md:block pr-1">
          <p className="text-xs font-bold text-slate-800 leading-none">
            {user.name}
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
            {user.role === "admin" ? "HR Administrator" : "Employee"}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Menu Overlay Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
          {/* Top Info Context */}
          <div className="p-4 flex items-center gap-3 bg-slate-50/40">
            {user.image_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <Image
                  src={user.image_url}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#009473] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                {user.name}
              </h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="p-3 bg-white text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-medium">Role</span>
              <span className="font-bold text-slate-800">
                {user.role === "admin" ? "HR Administrator" : "Employee"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="font-medium">Team</span>
              <span className="font-bold text-slate-800">
                {user.role === "admin" ? "People Ops" : "Engineering"}
              </span>
            </div>
          </div>

          {/* Action Navigation Links */}
          <div className="p-1.5 bg-white space-y-0.5">
            <Link href="/my-profile">
              <button className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                My Profile
              </button>
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left group">
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              Workspace Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left group">
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              Help & Support
            </button>
          </div>

          {/* Sign Out Action Button */}
          <div className="p-1.5 bg-white">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left group active:scale-98"
              >
                <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
