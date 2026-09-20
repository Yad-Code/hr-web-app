// @/app/(admin)/dashboard/_components/cards.tsx
import {
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";

const iconMap = {
  users: {
    icon: UserGroupIcon,
    bg: "bg-indigo-50",
    color: "text-indigo-600",
  },
  positions: {
    icon: BriefcaseIcon,
    bg: "bg-amber-50",
    color: "text-amber-600",
  },
  pending: {
    icon: ClipboardDocumentCheckIcon,
    bg: "bg-rose-50",
    color: "text-rose-600",
  },
  attendance: {
    icon: ChartBarIcon,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
};

export function Card({
  title,
  value,
  type,
  trend,
}: {
  title: string;
  value: number | string;
  type: "users" | "positions" | "pending" | "attendance";
  trend: React.ReactNode;
}) {
  const config = iconMap[type];
  const Icon = config.icon;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-35">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          <h2
            className={`${lusitana.className} text-3xl font-extrabold text-slate-900 mt-1.5`}
          >
            {value}
          </h2>
        </div>

        <div
          className={`p-2.5 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}
        >
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="text-xs font-medium mt-3 flex items-center gap-1">
        {trend}
      </div>
    </div>
  );
}
