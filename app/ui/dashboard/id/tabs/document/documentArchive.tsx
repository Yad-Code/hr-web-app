import { File, FileText } from "lucide-react";
import { EmployeeDocument } from "@/app/lib/employee/definitions";
import { DocumentRow } from "./documentRow";

export function DocumentArchive({
  documents,
  deletingId,
  onDeleteClick,
}: {
  documents: EmployeeDocument[];
  deletingId: string | null;
  onDeleteClick: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <File className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Document Archive
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          Total Files: {documents.length}
        </span>
      </div>

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
            <DocumentRow
              key={doc.id}
              doc={doc}
              isDeleting={deletingId === doc.id}
              onDelete={() => onDeleteClick(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
