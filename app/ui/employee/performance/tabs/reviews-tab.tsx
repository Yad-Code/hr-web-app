// app/ui/employee/performance/tabs/reviews-tab.tsx
"use client";

import { useState, useTransition, FormEvent } from "react";
import { PerformanceReview } from "@/app/lib/performance/definitions";
import {
  updateEmployeeComments,
  acknowledgeReview,
} from "@/app/lib/performance/actions/reviews";
import { formatDate } from "@/app/lib/utils";

export default function ReviewsTab({
  reviews,
}: {
  reviews: PerformanceReview[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeMessage, setActiveMessage] = useState<{
    id: string;
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleCommentSubmit = (
    reviewId: string,
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const comments = formData.get("employee_comments") as string;

    startTransition(async () => {
      setActiveMessage(null);
      const result = await updateEmployeeComments(reviewId, comments);
      if (result.success) {
        setActiveMessage({
          id: reviewId,
          type: "success",
          text: "Comments saved successfully.",
        });
        setTimeout(() => setActiveMessage(null), 3000);
      } else {
        setActiveMessage({
          id: reviewId,
          type: "error",
          text: result.error || "Failed to save comments.",
        });
      }
    });
  };

  const handleAcknowledge = (reviewId: string) => {
    startTransition(async () => {
      setActiveMessage(null);
      const result = await acknowledgeReview(reviewId);
      if (result.success) {
        setActiveMessage({
          id: reviewId,
          type: "success",
          text: "Review officially acknowledged.",
        });
        setTimeout(() => setActiveMessage(null), 3000);
      } else {
        setActiveMessage({
          id: reviewId,
          type: "error",
          text: result.error || "Failed to acknowledge review.",
        });
      }
    });
  };

  // Helper for dynamic rating styling
  const getRatingBadgeStyle = (rating: string | number) => {
    const numRating = typeof rating === "number" ? rating : parseFloat(rating);
    if (numRating >= 4.5 || rating === "Exceeds Expectations") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (numRating >= 3.0 || rating === "Meets Expectations") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Performance Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Official manager evaluations and review cycle history.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="text-xs font-semibold border border-slate-300 text-slate-700 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          🖨️ Print Records
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">
            No performance reviews available.
          </p>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className="p-6 border border-slate-200 rounded-xl bg-white shadow-xs space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {review.period} Performance Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reviewed by{" "}
                  <span className="font-semibold text-slate-700">
                    {review.reviewer}
                  </span>{" "}
                  on {formatDate(review.date)}
                </p>
              </div>

              <span
                className={`px-3 py-1 font-semibold rounded-full text-xs border ${getRatingBadgeStyle(review.rating)}`}
              >
                Rating: {review.rating}
              </span>
            </div>

            {/* Notification Banner */}
            {activeMessage && activeMessage.id === review.id && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  activeMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {activeMessage.text}
              </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                <h4 className="font-bold text-slate-700 mb-1 text-xs">
                  Key Strengths
                </h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {review.strengths}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-lg">
                <h4 className="font-bold text-slate-700 mb-1 text-xs">
                  Areas for Improvement
                </h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {review.improvements}
                </p>
              </div>
            </div>

            {/* Manager Comments */}
            <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-lg text-xs">
              <h4 className="font-bold text-slate-800 mb-1">
                Manager Overview & Feedback
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {review.manager_comments}
              </p>
            </div>

            {/* Employee Comments Form */}
            <form
              onSubmit={(e) => handleCommentSubmit(review.id, e)}
              className="space-y-3 pt-2"
            >
              <label className="block text-xs font-bold text-slate-700">
                Employee Reflections & Comments
              </label>
              <textarea
                name="employee_comments"
                defaultValue={review.employee_comments || ""}
                disabled={isPending || review.acknowledged}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Add your reflections or notes on this review..."
                rows={3}
              />

              <div className="flex items-center justify-between pt-2">
                {/* Acknowledgment Status */}
                <div>
                  {review.acknowledged ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                      ✓ Acknowledged on {formatDate(review.acknowledged_at)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(review.id)}
                      disabled={isPending}
                      className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isPending ? "Processing..." : "Acknowledge & Sign Off"}
                    </button>
                  )}
                </div>

                {!review.acknowledged && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isPending ? "Saving..." : "Save Reflections"}
                  </button>
                )}
              </div>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
