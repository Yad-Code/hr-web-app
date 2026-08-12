// @/app/(admin)/dashboard/(overview)/performance/reviews/page.tsx

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import Link from "next/link";
import { ArrowLeft, Plus, Star, FileText, Calendar, UserCheck } from "lucide-react";

interface ReviewRow {
  id: string;
  user_id: string;
  employee_name: string;
  department: string;
  job_title: string;
  image_url: string;
  period: string;
  date: string | Date;
  reviewer: string;
  rating: number;
  status: string;
}

export default async function PerformanceReviewsPage() {
  // Fetch reviews joined with user metadata
  const reviews = (await db`
    SELECT 
      pr.id,
      pr.user_id,
      pr.period,
      pr.date,
      pr.reviewer,
      pr.rating,
      pr.status,
      u.name as employee_name,
      u.department,
      u.job_title,
      u.image_url
    FROM performance_reviews pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.date DESC
  `) as unknown as ReviewRow[];

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    if (rating >= 3.5) return "bg-blue-50 text-blue-700 border-blue-200/80";
    if (rating >= 2.5) return "bg-amber-50 text-amber-700 border-amber-200/80";
    return "bg-rose-50 text-rose-700 border-rose-200/80";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/performance"
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Performance Reviews
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View and manage formal evaluations across the organization.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/performance/reviews/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Review
        </Link>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Review Period</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            review.image_url ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                          }
                          alt={review.employee_name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {review.employee_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {review.job_title} • {review.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {review.period}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {review.reviewer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getRatingBadge(
                          Number(review.rating)
                        )}`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {Number(review.rating).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                          review.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/performance/reviews/${review.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    No performance reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}