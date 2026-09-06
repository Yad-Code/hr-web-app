// @/app/(admin)/dashboard/(overview)/performance/reviews/[id]/page.tsx
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Calendar,
  UserCheck,
  Briefcase,
  FileText,
  CheckCircle,
} from "lucide-react";
import { auth } from "@/auth";

interface ReviewDetailRow {
  id: string;
  user_id: string;
  period: string;
  date: string | Date;
  reviewer: string;
  rating: string | number;
  strengths: string | null;
  improvements: string | null;
  manager_comments: string | null;
  employee_comments: string | null;
  goals_for_next_cycle: string | null;
  status: string;
  acknowledged: boolean;
  acknowledged_at: string | Date | null;
  employee_name: string;
  department: string;
  job_title: string;
  image_url: string;
}

export default async function ReviewDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "admin";
  const managerName = session.user.name as string;

  let result;

  if (isAdmin) {
    result = await db`
      SELECT pr.*, u.name as employee_name, u.department, u.job_title, u.image_url
      FROM performance_reviews pr JOIN users u ON pr.user_id = u.id
      WHERE pr.id = ${id}
    `;
  } else {
    result = await db`
      SELECT pr.*, u.name as employee_name, u.department, u.job_title, u.image_url
      FROM performance_reviews pr JOIN users u ON pr.user_id = u.id
      WHERE pr.id = ${id} AND u.manager_name = ${managerName}
    `;
  }

  if (result.length === 0) {
    notFound();
  }

  const review = result[0] as unknown as ReviewDetailRow;

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5)
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    if (rating >= 3.5) return "bg-blue-50 text-blue-700 border-blue-200/80";
    if (rating >= 2.5) return "bg-amber-50 text-amber-700 border-amber-200/80";
    return "bg-rose-50 text-rose-700 border-rose-200/80";
  };

  const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/performance/reviews"
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Performance Review Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {review.period} Evaluation for {review.employee_name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
            <Image
              src={
                review.image_url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt={review.employee_name}
              width={36}
              height={36}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-xs"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {review.employee_name}
              </h2>
              <p className="text-sm font-medium text-slate-600 flex items-center justify-center gap-1.5 mt-1">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {review.job_title}
              </p>
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg mt-3">
                {review.department}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Evaluation Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">
                  Overall Rating
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold border ${getRatingBadge(Number(review.rating))}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  {Number(review.rating).toFixed(1)} / 5.0
                </span>
              </div>
              <div>
                <span className=" text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date & Period
                </span>
                <p className="font-medium text-slate-800">{formattedDate}</p>
                <p className="text-xs text-slate-500">{review.period}</p>
              </div>
              <div>
                <span className=" text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Reviewed By
                </span>
                <p className="font-medium text-slate-800">{review.reviewer}</p>
              </div>
              <div className="pt-2 border-t border-slate-50">
                <span className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Employee Sign-Off
                </span>
                {review.acknowledged ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border bg-emerald-50 text-emerald-700 border-emerald-200/80 w-full justify-center">
                    ✓ Signed on{" "}
                    {new Date(review.acknowledged_at!).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border bg-amber-50 text-amber-700 border-amber-200/80 w-full justify-center">
                    Pending Signature
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Key Strengths
              </h3>
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {review.strengths || "No specific strengths recorded."}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Areas for Improvement
              </h3>
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {review.improvements ||
                    "No specific areas for improvement recorded."}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Managers Comments
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {review.manager_comments ||
                    "No additional comments provided by the manager."}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Employees Comments
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                  {review.employee_comments ||
                    "No comments provided by the employee."}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Goals for Next Cycle
              </h3>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <p className="text-sm text-indigo-900/80 font-medium leading-relaxed whitespace-pre-wrap">
                  {review.goals_for_next_cycle ||
                    "No goals have been set for the next cycle yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
