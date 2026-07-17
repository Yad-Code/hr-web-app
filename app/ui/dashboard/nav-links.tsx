"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { 
  LayoutGrid, 
  Users, 
  TrendingUp, 
  Clock, 
  FolderLock, 
  Settings 
} from "lucide-react";

const links = {
  admin: [
    { name: "Dashboard", sub: "Overview & KPIs", href: "/dashboard", icon: LayoutGrid },
    { name: "Employee Directory", sub: "All team members", href: "/dashboard/employees", icon: Users },
    { name: "Performance", sub: "Reviews & goals", href: "/dashboard/performance", icon: TrendingUp },
    { name: "Time & Attendance", sub: "Check-ins & hours", href: "/dashboard/time-&-attendance", icon: Clock },
    { name: "Document Vault", sub: "Policies & records", href: "/dashboard/documents", icon: FolderLock },
    { name: "Settings", sub: "Workspace config", href: "/dashboard/settings", icon: Settings },
  ],
  employee: [
    { name: "My Profile", sub: "Personal portal", href: "/dashboard", icon: LayoutGrid },
    { name: "My Attendance", sub: "Check-ins & logs", href: "/dashboard/employees", icon: Clock },
    { name: "My Documents", sub: "Personal records", href: "/dashboard/performance", icon: FolderLock },
    { name: "Team Directory", sub: "All team members", href: "/dashboard/time-&-attendance", icon: Users },
  ],
};

interface NavLinksProps {
  role: 'admin' | 'employee';
}

export default function NavLinks({ role }: NavLinksProps) {
  const pathname = usePathname();
  const activeLinks = links[role] || links.employee;

  return (
    <>
      {activeLinks.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group",
              {
                // Active configuration matching the bright teal tint accent
                "bg-[#eaf8f5] text-[#007a64]": isActive,
                // Clean default state
                "bg-transparent text-slate-700 hover:bg-slate-50": !isActive,
              }
            )}
          >
            {/* Left aligned navigation icon */}
            <LinkIcon 
              className={clsx("w-5 h-5 flex-shrink-0 transition-colors", {
                "text-[#009473] stroke-[2.25]": isActive,
                "text-slate-400 group-hover:text-slate-600 stroke-[1.75]": !isActive,
              })} 
            />

            {/* Stacked title and subtext label */}
            <div className="flex flex-col leading-tight min-w-0">
              <span className={clsx("text-sm font-bold tracking-tight", {
                "text-[#005c4b]": isActive,
                "text-slate-900": !isActive
              })}>
                {link.name}
              </span>
              <span className={clsx("text-xs font-normal mt-0.5 truncate", {
                "text-[#007a64]/70": isActive,
                "text-slate-500": !isActive
              })}>
                {link.sub}
              </span>
            </div>
          </Link>
        );
      })}
    </>
  );
}