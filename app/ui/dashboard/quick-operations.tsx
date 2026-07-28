import { fetchPendingAdminRequests } from "@/app/lib/employee/data";
import { RequestItem } from "./request-items";
import { EmployeeOperations } from "./employee-operations";

// 1. Declare the strict shape your RequestItem component requires
interface PendingRequestType {
  id: string;
  type: string;
  description: string;
  status: string;
  created_at: Date;
  employee_name: string;
  employee_image: string | null;
}

interface QuickOperationsProps {
  isAdmin: boolean;
}

export async function QuickOperationsWidget({ isAdmin }: QuickOperationsProps) {
  // 2. Type cast the array response so TypeScript safely tracks the structural properties
  const pendingRequests = isAdmin 
    ? (await fetchPendingAdminRequests()) as PendingRequestType[] 
    : [];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col xl:min-h-[420px] w-full overflow-hidden">
      
      {/* Unified Dynamic Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {isAdmin ? "Pending Approvals" : "Quick Operations"}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            {isAdmin ? "Action required on team requests" : "Submit new requests"}
          </p>
        </div>
        {isAdmin && pendingRequests.length > 0 && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold animate-fadeIn">
            {pendingRequests.length}
          </span>
        )}
      </div>

      {/* Main Content Layout Body Selection */}
      <div className="flex-1 p-0 overflow-y-auto">
        {!isAdmin ? (
          <EmployeeOperations />
        ) : pendingRequests.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center h-full p-8 space-y-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-xl select-none">
              ✨
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending requests to review.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((request) => (
              <RequestItem key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}