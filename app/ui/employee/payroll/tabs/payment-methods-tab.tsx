// app/ui/employee/payroll/tabs/payment-methods-tab.tsx
"use client";

import { useState } from "react";
import { PaymentMethod } from "@/app/lib/employeeDashboard/payroll/definitions";

interface PaymentMethodsTabProps {
  methods: PaymentMethod[];
  onAddAccount: (formData: FormData) => Promise<void>;
}

export default function PaymentMethodsTab({
  methods,
  onAddAccount,
}: PaymentMethodsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Direct Deposit Accounts
          </h2>
          <p className="text-xs text-slate-500">
            Manage bank accounts where your salary gets deposited
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMessage(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          + Add Payment Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`p-5 bg-white border rounded-xl shadow-xs space-y-4 relative ${
              method.is_primary
                ? "border-blue-500 ring-1 ring-blue-500/20"
                : "border-slate-200"
            }`}
          >
            {method.is_primary && (
              <span className="absolute top-4 right-4 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                Primary Deposit
              </span>
            )}

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">
                {method.bank_name}
              </p>
              <p className="text-xs text-slate-500">{method.account_holder}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-slate-800">
                  {method.account_number_masked}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Routing / IBAN:</span>
                <span className="font-mono text-slate-700">
                  {method.routing_or_iban}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                ✓{" "}
                {method.status === "verified"
                  ? "Verified Account"
                  : "Pending HR Verification"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Add Direct Deposit Account
            </h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form
              action={async (formData) => {
                setLoading(true);
                setErrorMessage(null);
                try {
                  await onAddAccount(formData);
                  setShowAddModal(false);
                } catch (err: unknown) {
                  setErrorMessage(
                    err instanceof Error
                      ? err.message
                      : "Failed to save account.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  placeholder="e.g. Chase, Bank of America"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="account_holder"
                  placeholder="Full Legal Name"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Number / IBAN
                </label>
                <input
                  type="password"
                  name="account_number"
                  placeholder="Account Number"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Routing / SWIFT Code
                </label>
                <input
                  type="text"
                  name="routing_or_iban"
                  placeholder="9-digit routing or SWIFT"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
