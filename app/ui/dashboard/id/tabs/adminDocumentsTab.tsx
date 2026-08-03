// @/app/ui/dashboard/id/adminDocumentsTab.tsx
"use client";

import React, { useState, useTransition, useRef } from "react";
import {
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  Link as LinkIcon,
  AlertTriangle,
  X,
  Tag,
  File,
} from "lucide-react";
import { EmployeeDocument } from "@/app/lib/employee/definitions";
// Replace with your actual document actions
// import { addDocumentAction, deleteDocumentAction } from "@/app/lib/employee/profile/actions";

interface AdminDocumentsTabProps {
  documents: EmployeeDocument[];
  userId: string;
}

export default function AdminDocumentsTab({
  documents = [],
  userId,
}: AdminDocumentsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal States
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const initialFormState = {
    title: "",
    category: "",
    file_url: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    startTransition(async () => {
      try {
        // await addDocumentAction(userId, data);
        console.log("Saving document for:", userId, formData);
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
        handleReset();
      } catch (err) {
        console.error("Failed to add document:", err);
      }
    });
  };

  // Confirm and proceed with deletion
  const confirmDelete = () => {
    if (!itemToDelete) return;

    const id = itemToDelete;
    setItemToDelete(null);
    setDeletingId(id);

    startTransition(async () => {
      try {
        // await deleteDocumentAction(id);
        console.log("Deleting document id:", id);
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
      } catch (err) {
        console.error("Failed to delete document:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* ADMIN CONTROL HEADER */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold tracking-wide">
            Admin Documents Management
          </h2>
        </div>
        <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          Target Employee ID: {userId || "N/A"}
        </span>
      </div>

      {/* SECTION 1: ADD NEW DOCUMENT FORM */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Upload className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Upload Official Document
          </h2>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField
              label="Document Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Passport Copy, Signed Contract"
              icon={FileText}
              required
            />
            <SelectField
              label="Document Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              icon={Tag}
              options={[
                "Identification",
                "Contract / Legal",
                "Payroll / Tax",
                "Medical / Insurance",
                "Certificates",
                "Other",
              ]}
              required
            />
            <InputField
              label="File URL / Cloud Link"
              name="file_url"
              type="url"
              value={formData.file_url}
              onChange={handleChange}
              placeholder="https://your-storage.com/file.pdf"
              icon={LinkIcon}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Document
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: DOCUMENT LIST */}
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
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
            Total Files: {documents.length}
          </span>
        </div>

        {/* Empty State[cite: 5] */}
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
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-3 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {doc.title}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
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

                {/* Admin Actions */}
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
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition cursor-pointer"
                    title="Delete Document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORMAL CONFIRMATION DELETE MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Official Document
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete this document? It
                  will be removed from the employees archive immediately.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Input Field Component
function InputField({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-slate-900 focus:border-slate-900 block p-2.5 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100/80 ${
            Icon ? "pl-9" : ""
          }`}
          placeholder={placeholder}
          {...props}
        />
      </div>
    </div>
  );
}

// Reusable Select Field Component
function SelectField({
  label,
  options,
  icon: Icon,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <select
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-slate-900 focus:border-slate-900 block p-2.5 outline-none transition-all cursor-pointer ${
            Icon ? "pl-9" : ""
          }`}
          {...props}
        >
          <option value="">Select Category...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
