// @/app/(admin)/dashboard/(overview)/performance/meetings/page.tsx
import Link from "next/link";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { getAllAdminMeetings } from "@/app/lib/admin/performance/data";
import { AdminMeetingsTable } from "./_components/AdminMeetingsTable";
import { auth } from "@/auth";

export default async function AdminMeetingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const meetings = await getAllAdminMeetings();

  return (
    <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Navigation */}
      <div>
        <Link
          href="/dashboard/performance"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Performance Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-purple-600" />
              1-on-1 Sync Meetings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin
                ? "Manage and track all scheduled 1-on-1 performance syncs across all employees."
                : "Manage and track scheduled 1-on-1 performance syncs for your direct reports."}
            </p>
          </div>
          <Link
            href="/dashboard/performance/meetings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule New Meeting
          </Link>
        </div>
      </div>

      {/* Interactive Table Component */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <AdminMeetingsTable initialMeetings={meetings} />
      </div>
    </main>
  );
}
