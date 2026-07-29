// app/ui/employee/payroll/tabs/company-docs-tab.tsx
"use client";

import { Document } from "@/app/lib/employeeDashboard/payroll/definitions";

export default function CompanyDocsTab({
  documents,
}: {
  documents: Document[];
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Company & Payroll Documents
          </h2>
          <p className="text-xs text-slate-500">
            Official statements and agreements issued by HR
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-white flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs uppercase">
                  {doc.type}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Year {doc.year} • Issued {doc.issued_date} • {doc.file_size}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
