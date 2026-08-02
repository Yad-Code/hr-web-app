"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminPayrollRecord } from "@/app/lib/admin/payroll/data";
import Link from "next/link";

interface AdminPayrollTableProps {
  initialData: AdminPayrollRecord[];
}

export function AdminPayrollTable({ initialData }: AdminPayrollTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = initialData.filter(
    (record) =>
      record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee_email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
            Paid
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
            Processing
          </span>
        );
      case "held":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">
            Held
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees by name or email..."
            className="block w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Pay Period</th>
              <th className="px-6 py-4">Pay Date</th>
              <th className="px-6 py-4 text-right">Gross Pay</th>
              <th className="px-6 py-4 text-right">Net Pay</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  No payroll records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.employee_name)}&background=f1f5f9&color=64748b`;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full shrink-0">
                          <Image
                            src={record.image_url || fallbackAvatar}
                            alt={record.employee_name}
                            fill
                            className="object-cover rounded-full bg-slate-100"
                            sizes="36px"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {record.employee_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {record.employee_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(record.pay_period_start)} -{" "}
                      {formatDate(record.pay_period_end)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {formatDate(record.pay_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">
                      {formatCurrency(record.gross_pay)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      {formatCurrency(record.net_pay)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/dashboard/payroll/${record.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
