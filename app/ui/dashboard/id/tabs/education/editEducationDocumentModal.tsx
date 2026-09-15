import React from "react";
import { FileText, X } from "lucide-react";

export function EditEducationDocumentModal({
  docModalItem,
  onClose,
  onSave,
}: {
  docModalItem: { id: string; level: string; currentUrl?: string | null };
  onClose: () => void;
  // 👇 FIX 1: Expect FormData
  onSave: (formData: FormData) => void;
}) {
  // 👇 FIX 2: Correct form handling
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(new FormData(e.currentTarget));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Attach Education Document
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload the diploma, degree, or certificate for{" "}
                <span className="font-semibold text-slate-700">
                  {docModalItem.level}
                </span>
                .
              </p>
            </div>

            {/* 👇 FIX 3: File Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select File
              </label>
              <input
                type="file"
                name="document_file"
                accept=".pdf,image/*"
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition-all"
              />
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
