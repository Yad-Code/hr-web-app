// @/app/ui/employee/profile/tabs/documentsTab.tsx

import { FileText, Download, Eye, Lock } from "lucide-react";
import { EmployeeDocument } from "@/app/lib/employee/definitions";

export default function DocumentsTab({
  documents = [],
}: {
  documents: EmployeeDocument[];
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Official Documents
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          HR Managed Only
        </span>
      </div>

      {/* Document List / Empty State */}
      {documents.length === 0 ? (
        <div className="text-center py-10 text-slate-400 space-y-2">
          <FileText className="w-8 h-8 mx-auto stroke-1" />
          <p className="text-xs font-medium">
            No official documents uploaded yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {doc.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {doc.category}
                    {doc.uploaded_at &&
                      ` • ${new Date(doc.uploaded_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}`}
                    {doc.file_size && ` • ${doc.file_size}`}
                  </p>
                </div>
              </div>

              {/* Read-only Employee Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a
                  href={doc.file_url}
                  download
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
