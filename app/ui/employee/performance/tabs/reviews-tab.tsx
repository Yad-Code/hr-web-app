// app/ui/employee/performance/tabs/reviews-tab.tsx
"use client";

import { useTransition } from "react";
import { PerformanceReview } from "@/app/lib/performance/definitions";
import { updateEmployeeComments } from "@/app/lib/performance/actions/reviews";

export default function ReviewsTab({ reviews }: { reviews: PerformanceReview[] }) {
  const [isPending, startTransition] = useTransition();

  const handleCommentSubmit = (reviewId: string, formData: FormData) => {
    const comments = formData.get("employee_comments") as string;
    
    startTransition(async () => {
      const result = await updateEmployeeComments(reviewId, comments); // Uses the server action[cite: 7]
      if (!result.success) {
        alert("Failed to save comments.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Performance Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-slate-500">No performance reviews available.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800">{review.period} Review</h3>
                <p className="text-sm text-slate-500">Reviewed by {review.reviewer} on {String(review.date)}</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full text-sm">
                Rating: {review.rating}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-700">Strengths</h4>
                <p className="text-slate-600 mt-1">{review.strengths}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700">Areas for Improvement</h4>
                <p className="text-slate-600 mt-1">{review.improvements}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-sm">
              <h4 className="font-semibold text-slate-700">Manager Comments</h4>
              <p className="text-slate-600 mt-1">{review.manager_comments}</p>
            </div>

            {/* Employee Comments Form */}
            <form action={(formData) => handleCommentSubmit(review.id, formData)} className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">My Comments (Optional)</label>
              <textarea
                name="employee_comments"
                defaultValue={review.employee_comments || ""}
                disabled={isPending}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                placeholder="Add your reflections on this review..."
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Comments"}
                </button>
              </div>
            </form>
          </div>
        ))
      )}
    </div>
  );
}