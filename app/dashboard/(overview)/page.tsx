import { Card } from "@/app/ui/dashboard/cards";
import { RetentionEngagementChart } from "@/app/ui/dashboard/line-chart";
import { lusitana } from "@/app/ui/fonts";

export default function Page() {
  const titles = [
    "Total HeadCount",
    "Open Positions",
    "Pending Requests",
    "Avg. Attendance Rate",
  ];
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Dashboard Title Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1
          className={`${lusitana.className} text-2xl md:text-3xl font-bold tracking-tight text-slate-900`}
        >
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time metrics and company workforce analytics trends.
        </p>
      </div>

      {/* Top Summary Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title={titles[0]}
          value="247"
          type="users"
          trend={<span className="text-green-500">+4.5% This month</span>}
        />
        <Card
          title={titles[1]}
          value="18"
          type="positions"
          trend={<span className="text-green-500">+2 This month</span>}
        />
        <Card
          title={titles[2]}
          value="34"
          type="pending"
          trend={<span className="text-green-500">+9 Pending</span>}
        />
        <Card
          title={titles[3]}
          value="48"
          type="attendance"
          trend={<span className="text-green-500">+3% This Season</span>}
        />
      </div>

      {/* Main Analytics Content Layout */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Chart takes up 2 columns on large screens for ideal rendering size */}
        <div className="xl:col-span-2 flex flex-col justify-between">
          <RetentionEngagementChart />
        </div>

        {/* Placeholder panel for upcoming features (e.g., Quick Actions, Recent Activity Logs) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-slate-400 text-lg">⚡</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Quick Operations
          </h3>
          <p className="text-xs text-slate-400 max-w-[200px] mt-1">
            Approvals, dynamic reports, and employee shifts will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}
