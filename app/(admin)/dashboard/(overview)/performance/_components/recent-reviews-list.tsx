// @/app/(admin)/dashboard/(overview)/performance/_components/recent-reviews-list.tsx
import { TrendingUp, ArrowRight } from "lucide-react";
import { ReviewRow } from "../types";
import Link from "next/link";

export function RecentReviewsList({ reviews }: { reviews: ReviewRow[] }) {
  // Helper to color-code the ratings
  const getRatingColor = (rating: string | number) => {
    const num = Number(rating);
    if (num >= 4.0) return "text-emerald-600";
    if (num >= 3.0) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#009473]" />
          Recent Employee Reviews
        </h2>
        <Link
          href="/dashboard/performance/reviews"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    review.image_url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  }
                  alt={review.employee_name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {review.employee_name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {review.department} • {review.period} •{" "}
                    {new Date(review.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${getRatingColor(review.rating)}`}
                  >
                    ★ {Number(review.rating).toFixed(1)}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    By {review.reviewer}
                  </p>
                </div>

                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                  {review.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-xs text-slate-400">
            No performance reviews recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
