import { Plane, Receipt } from "lucide-react";

export function EmployeeOperations() {
  return (
    <div className="p-6 flex flex-col gap-3 h-full justify-center">
      <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#009473] hover:bg-[#eaf8f5] transition-all group text-left active:scale-[0.99]">
        <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5 text-slate-400 group-hover:text-[#009473]" />
        </div>
        <div>
          <span className="block text-sm font-bold text-slate-700 group-hover:text-[#007a64]">
            Request Time-Off
          </span>
          <span className="block text-[11px] text-slate-400">Vacation, sick leave, etc.</span>
        </div>
      </button>

      <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#009473] hover:bg-[#eaf8f5] transition-all group text-left active:scale-[0.99]">
        <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center flex-shrink-0">
          <Receipt className="w-5 h-5 text-slate-400 group-hover:text-[#009473]" />
        </div>
        <div>
          <span className="block text-sm font-bold text-slate-700 group-hover:text-[#007a64]">
            Submit Expense
          </span>
          <span className="block text-[11px] text-slate-400">Reimbursement claims</span>
        </div>
      </button>
    </div>
  );
}