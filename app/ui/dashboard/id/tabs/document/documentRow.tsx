import { FileText, Eye, Download, Loader2, Trash2 } from "lucide-react";
import { EmployeeDocument } from "@/app/lib/employee/definitions";

export function DocumentRow({
  doc,
  isDeleting,
  onDelete,
}: {
  doc: EmployeeDocument;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-3 rounded-xl transition">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs border border-indigo-100/50">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{doc.title}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {doc.category}
            {doc.uploaded_at &&
              ` • ${new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}`}
            {doc.file_size && ` • ${doc.file_size}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href={doc.file_url}
          target="_blank"
          rel="noreferrer"
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          title="Preview Document"
        >
          <Eye className="w-4 h-4" />
        </a>
        <a
          href={doc.file_url}
          download
          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          title="Download Document"
        >
          <Download className="w-4 h-4" />
        </a>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition cursor-pointer"
          title="Delete Document"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
