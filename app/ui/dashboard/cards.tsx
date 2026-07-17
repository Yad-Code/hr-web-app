import {
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { lusitana } from "../fonts";

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

export default async function CardWrapper() {
  const kpi = {
    totalHeadCount: 1248,
    openPositions: 37,
    pendingRequests: 5,
    avgAttendance: "96.4%",
  };

  return (
    <>
      <Card 
        title="TOTAL HEADCOUNT" 
        value={kpi.totalHeadCount} 
        type="users" 
        trend={<span className="text-emerald-600">↑ +3 this month</span>}
      />
      <Card 
        title="OPEN POSITIONS" 
        value={kpi.openPositions} 
        type="positions" 
        trend={<span className="text-rose-600">↓ 6 urgent</span>}
      />
      <Card
        title="PENDING REQUESTS"
        value={kpi.pendingRequests}
        type="pending"
        trend={<span className="text-rose-600">↓ 12 need action</span>}
      />
      <Card
        title="AVG. ATTENDANCE RATE"
        value={kpi.avgAttendance}
        type="attendance"
        trend={<span className="text-emerald-600">↑ +1.4% vs last month</span>}
      />
    </>
  );
}

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
      {/* Top Section: Text Info left aligned, Icon right aligned */}
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          <h2 className={`${lusitana.className} text-3xl font-extrabold text-slate-900 mt-1.5`}>
            {value}
          </h2>
        </div>
        
        {/* Soft Colored Circle Wrapper for the Icon */}
        <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </div>
      </div>

      {/* Bottom Trend Subtitle section */}
      <div className="text-xs font-medium mt-3 flex items-center gap-1">
        {trend}
      </div>
    </div>
  );
}