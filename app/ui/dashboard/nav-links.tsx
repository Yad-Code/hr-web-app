"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutGrid,
  Users,
  TrendingUp,
  Clock,
  Settings,
  CreditCard,
  Briefcase,
  FileCheck2,
} from "lucide-react";

const links = {
  admin: [
    {
      name: "Dashboard",
      sub: "Overview & KPIs",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      name: "Employee Directory",
      sub: "All team members",
      href: "/dashboard/employees",
      icon: Users,
    },
    {
      name: "Time & Requests",
      sub: "Attendance & approvals",
      href: "/dashboard/attendance",
      icon: Clock,
    },
    {
      name: "Performance",
      sub: "Reviews & team goals",
      href: "/dashboard/performance",
      icon: TrendingUp,
    },
    {
      name: "Payroll",
      sub: "Pay stubs & salaries",
      href: "/dashboard/payroll",
      icon: CreditCard,
    },
    {
      name: "Recruitment",
      sub: "Job postings & hiring",
      href: "/dashboard/recruitment",
      icon: Briefcase,
    },
    {
      name: "Settings",
      sub: "Workspace config",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
  employee: [
    {
      name: "My Profile",
      sub: "Personal portal",
      href: "/my-profile",
      icon: LayoutGrid,
    },
    {
      name: "My Attendance",
      sub: "Check-ins & logs",
      href: "/my-profile/attendance",
      icon: Clock,
    },
    {
      name: "My Requests",
      sub: "Leave & WFH applications",
      href: "/my-profile/requests",
      icon: FileCheck2,
    },
    {
      name: "My Performance",
      sub: "KPIs & past reviews",
      href: "/my-profile/performance",
      icon: TrendingUp,
    },
    {
      name: "My Payroll",
      sub: "Current & past payslips",
      href: "/my-profile/payroll",
      icon: CreditCard,
    },
  ],
};

interface NavLinksProps {
  role: "admin" | "employee";
}

export default function NavLinks({ role }: NavLinksProps) {
  const pathname = usePathname();
  const activeLinks = links[role] || links.employee;

  return (
    <>
      {activeLinks.map((link) => {
        const LinkIcon = link.icon;

        // Strict & nested active route detection
        const isRoot =
          link.href === "/dashboard" || link.href === "/my-profile";
        const isActive = isRoot
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group",
              {
                "bg-[#eaf8f5] text-[#007a64]": isActive,
                "bg-transparent text-slate-700 hover:bg-slate-50": !isActive,
              },
            )}
          >
            <LinkIcon
              className={clsx("w-5 h-5 shrink-0 transition-colors", {
                "text-[#009473] stroke-[2.25]": isActive,
                "text-slate-400 group-hover:text-slate-600 stroke-[1.75]":
                  !isActive,
              })}
            />

            <div className="flex flex-col leading-tight min-w-0">
              <span
                className={clsx("text-sm font-bold tracking-tight", {
                  "text-[#005c4b]": isActive,
                  "text-slate-900": !isActive,
                })}
              >
                {link.name}
              </span>
              <span
                className={clsx("text-xs font-normal mt-0.5 truncate", {
                  "text-[#007a64]/70": isActive,
                  "text-slate-500": !isActive,
                })}
              >
                {link.sub}
              </span>
            </div>
          </Link>
        );
      })}
    </>
  );
}
