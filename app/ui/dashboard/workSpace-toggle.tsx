"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

export function WorkspaceToggle({
  isAdmin,
  isManager,
  hasEmployeeView = true,
}: {
  isAdmin?: boolean;
  isManager?: boolean;
  hasEmployeeView?: boolean;
}) {
  const pathname = usePathname();

  if ((!isAdmin && !isManager) || !hasEmployeeView) return null;

  const isDashboard = pathname.startsWith("/dashboard");
  const target = isDashboard ? "/my-profile" : "/dashboard";
  const label = isDashboard
    ? "Switch to Employee View"
    : isAdmin
      ? "Switch to Admin View"
      : "Switch to Manager View";

  return (
    <Link
      href={target}
      className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all duration-150 mb-2 group"
    >
      <ArrowRightLeft className="w-4 h-4 stroke-2 text-indigo-500 group-hover:text-indigo-700 transition-colors" />
      <span>{label}</span>
    </Link>
  );
}
