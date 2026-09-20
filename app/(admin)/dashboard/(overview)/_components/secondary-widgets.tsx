// @/app/(admin)/dashboard/_components/secondary-widgets.tsx
import { auth } from "@/auth";
import { UserMinus, Briefcase, AlertCircle, Wallet } from "lucide-react";
import { getSecondaryWidgetsData } from "@/app/lib/admin/dashboard/data";

export async function SecondaryWidgets() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { outToday, complianceAlerts, payroll, activeJobs } = await getSecondaryWidgetsData(session.user.id);
  const formatDate = (date: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Widget 1: Who is Out Today */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-48">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><UserMinus className="w-4 h-4" /></div>
          <h3 className="font-bold text-slate-900 text-sm">Who is Out Today</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {outToday.length === 0 ? <p className="text-xs text-slate-500 font-medium">All team members are present.</p> : outToday.map((person, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">{person.name}</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${person.status === "Late" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{person.status}</span>
            </div>
          ))}
        </div>
      </div>
 
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-48">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase className="w-4 h-4" /></div>
          <h3 className="font-bold text-slate-900 text-sm">Active Job Postings</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {activeJobs.length === 0 ? <p className="text-xs text-slate-500 font-medium">No open positions right now.</p> : activeJobs.map((job, i) => (
            <div key={i} className="flex justify-between items-center text-xs border-l-2 border-indigo-400 pl-2">
              <span className="font-semibold text-slate-700">{job.department}</span>
              <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{job.count} Open</span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 3: Compliance Alerts */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-48">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
          <h3 className="font-bold text-slate-900 text-sm">Action Required</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {complianceAlerts.length === 0 ? <p className="text-xs text-slate-500 font-medium">No upcoming compliance alerts.</p> : complianceAlerts.map((alert, i) => (
            <div key={i} className="flex justify-between items-center text-xs border-l-2 border-amber-400 pl-2">
              <span className="font-semibold text-slate-700">{alert.name}</span>
              <span className="text-slate-500">Probation ends {formatDate(alert.probation_end)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 4: Payroll Run Status */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-48">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="w-4 h-4" /></div>
          <h3 className="font-bold text-slate-900 text-sm">Payroll Status</h3>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          {payroll ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-xs text-slate-500 font-medium">Period</span><span className="text-xs font-bold text-slate-700">{formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-500 font-medium">Payout Date</span><span className="text-xs font-bold text-slate-700">{formatDate(payroll.pay_date)}</span></div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center"><span className="text-xs text-slate-500 font-medium">Status</span><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${payroll.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{payroll.status}</span></div>
            </div>
          ) : <p className="text-xs text-slate-500 font-medium">No payroll history found.</p>}
        </div>
      </div>
    </div>
  );
}