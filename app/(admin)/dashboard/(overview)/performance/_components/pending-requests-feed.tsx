import { Bell, CheckCircle } from "lucide-react";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export async function PendingRequestsFeed() {
  // Fetch pending feedback requests from the notifications table
  const pendingRequests = await db`
    SELECT id, title, description, created_at 
    FROM performance_notifications 
    WHERE type = 'Feedback Request' AND is_read = false
    ORDER BY created_at DESC
    LIMIT 5
  `;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Pending Feedback Requests
        </h2>
      </div>

      <div className="p-4 space-y-2.5 overflow-y-auto max-h-[350px]">
        {pendingRequests && pendingRequests.length > 0 ? (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  {/* The title already contains "Feedback Request from [Name]" */}
                  <span className="text-xs font-bold text-slate-900 block">
                    {req.title}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {req.description}
                  </p>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                 {/* This button should open a modal to submit to user_feedback */}
                <button className="text-[10px] font-bold px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Provide Feedback
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-200" />
            <p className="text-xs font-medium text-slate-400">
              No pending requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}