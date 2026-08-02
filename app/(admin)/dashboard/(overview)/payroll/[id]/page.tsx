// @/app/(admin)/dashboard/(overview)/payroll/[id]/page.tsx
import Link from "next/link";
import {
  fetchPayStubDetails,
  fetchPayStubItems,
} from "@/app/lib/admin/payroll/data";
import {
  markAsPaid,
  verifyPaymentMethod,
  deletePayStub,
} from "@/app/lib/admin/payroll/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayStubDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const payStub = await fetchPayStubDetails(resolvedParams.id);
  const items = await fetchPayStubItems(resolvedParams.id);

  if (!payStub)
    return <div className="p-8 text-slate-500">Pay stub not found.</div>;

  const earnings = items.filter((i) => i.type === "earning");
  const deductions = items.filter((i) => i.type === "deduction");

  return (
    <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard/payroll"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
          >
            &larr; Back to Payroll
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Pay Stub Details
          </h1>
        </div>

        {/* Process Payment Form */}
        {payStub.status === "processing" && (
          <form
            action={async () => {
              "use server";
              await markAsPaid(payStub.id);
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs transition-all"
            >
              Mark as Paid
            </button>
          </form>
        )}
        {payStub.status === "paid" && (
          <span className="px-4 py-2 text-sm font-bold bg-emerald-100 text-emerald-800 rounded-lg uppercase tracking-wider">
            ✓ Payment Cleared
          </span>
        )}
        {/* Delete Pay Stub Button */}
        <form
          action={async () => {
            "use server";
            await deletePayStub(payStub.id);
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all shadow-xs"
          >
            Delete
          </button>
        </form>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 pb-6 mb-6 gap-6">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Employee
            </p>
            <p className="text-lg font-bold text-slate-900">
              {payStub.employee_name}
            </p>
            <p className="text-sm text-slate-600">
              {payStub.department} • {payStub.email}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Payment Date
            </p>
            <p className="text-sm font-medium text-slate-900">
              {new Date(payStub.pay_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Direct Deposit & Verification Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Direct Deposit Account
            </p>
            <p className="text-sm font-bold text-slate-900">
              {payStub.bank_name
                ? `${payStub.bank_name} (${payStub.account_number_masked})`
                : "No Bank Details Provided"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Account Status:{" "}
              <span
                className={`font-semibold capitalize ${
                  payStub.payment_status === "verified"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {payStub.payment_status || "pending"}
              </span>
            </p>
          </div>

          {payStub.payment_method_id &&
            payStub.payment_status !== "verified" && (
              <form
                action={async () => {
                  "use server";
                  await verifyPaymentMethod(
                    payStub.payment_method_id,
                    payStub.id,
                  );
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Verify Bank Details
                </button>
              </form>
            )}
        </div>

        {/* Itemized Table */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-4">Earnings</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            {earnings.map((item) => (
              <div
                key={item.id}
                className="flex justify-between p-4 border-b border-slate-100 last:border-0 bg-slate-50/50"
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.description}
                </span>
                <span className="text-sm font-medium text-slate-900">
                  ${Number(item.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-4">
            Deductions
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {deductions.map((item) => (
              <div
                key={item.id}
                className="flex justify-between p-4 border-b border-slate-100 last:border-0 bg-rose-50/30"
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.description}
                </span>
                <span className="text-sm font-medium text-rose-600">
                  -${Number(item.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 pt-6 flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Gross Pay</span>
              <span className="text-slate-900 font-medium">
                ${Number(payStub.gross_pay).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-900">Net Pay</span>
              <span className="text-emerald-600">
                ${Number(payStub.net_pay).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
