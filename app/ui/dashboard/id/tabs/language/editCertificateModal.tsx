import React, { useState } from "react";
import { FileText, X, Link as LinkIcon } from "lucide-react";
import { InputField } from "./formFields";

export function EditCertificateModal({
  docModalItem,
  onClose,
  onSave,
}: {
  docModalItem: { id: string; language: string; currentUrl?: string | null };
  onClose: () => void;
  onSave: (url: string | null) => void;
}) {
  const [documentUrlInput, setDocumentUrlInput] = useState(
    docModalItem.currentUrl || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(documentUrlInput.trim() || null);
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
                Attach Language Certificate Link
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the URL for{" "}
                <span className="font-semibold text-slate-700">
                  {docModalItem.language}
                </span>
                .
              </p>
            </div>

            <InputField
              label="Certificate URL"
              type="url"
              placeholder="https://example.com/certificate.pdf"
              value={documentUrlInput}
              onChange={(e) => setDocumentUrlInput(e.target.value)}
              icon={LinkIcon}
              required
            />
          </div>

          <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Save Certificate Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
