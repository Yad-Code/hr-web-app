"use client";

import React, { useState, useTransition, useRef } from "react";
import {
  Languages,
  Save,
  RotateCcw,
  Trash2,
  FilePlus,
  Loader2,
  AlertTriangle,
  X,
  FileText,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  User,
  IdCard,
  Volume2,
  BookOpen,
  PenTool,
  MessageSquare,
} from "lucide-react";

export interface LanguageEntry {
  id: string;
  user_id: string;
  language: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
  created_by: string;
  document_url?: string | null;
  created_at?: string;
}

interface LanguageTabProps {
  languageHistory: LanguageEntry[];
  userId: string;
  employeeId?: string;
  employeeName?: string;
}

const CEFR_LEVELS = [
  "A1 - Beginner",
  "A2 - Elementary",
  "B1 - Intermediate",
  "B2 - Upper Intermediate",
  "C1 - Advanced",
  "C2 - Mastery",
  "Native / Fluent",
];

export default function LanguageTab({
  languageHistory = [],
  userId,
  employeeId = "EMP-1029",
  employeeName = "Current User",
}: LanguageTabProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal States
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [docModalItem, setDocModalItem] = useState<{
    id: string;
    language: string;
    currentUrl?: string | null;
  } | null>(null);
  const [documentUrlInput, setDocumentUrlInput] = useState("");
  const [selectedItem, setSelectedItem] = useState<LanguageEntry | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const initialFormState = {
    language: "",
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
    document_url: "",
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
        const { addLanguageAction } =
          await import("@/app/lib/employee/profile/actions");
        await addLanguageAction(userId, employeeName, data);
        handleReset();
      } catch (err) {
        console.error("Failed to add language entry:", err);
      }
    });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    const id = itemToDelete;
    setItemToDelete(null);
    setDeletingId(id);

    startTransition(async () => {
      try {
        const { deleteLanguageAction } =
          await import("@/app/lib/employee/profile/actions");
        await deleteLanguageAction(id);
      } catch (err) {
        console.error("Failed to delete language entry:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const openDocumentModal = (
    id: string,
    language: string,
    currentUrl?: string | null,
  ) => {
    setDocModalItem({ id, language, currentUrl });
    setDocumentUrlInput(currentUrl || "");
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docModalItem) return;

    const targetId = docModalItem.id;
    const urlToSave = documentUrlInput.trim() || null;

    setDocModalItem(null);
    startTransition(async () => {
      try {
        const { updateLanguageDocumentAction } =
          await import("@/app/lib/employee/profile/actions");
        await updateLanguageDocumentAction(targetId, urlToSave);
      } catch (err) {
        console.error("Failed to update document URL:", err);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* FORM CONTAINER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
        {/* SECTION 1: EMPLOYEE INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Employee Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Employee ID"
              value={employeeId}
              disabled
              icon={IdCard}
            />
            <InputField
              label="Employee Name"
              value={employeeName}
              disabled
              icon={User}
            />
          </div>
        </div>

        {/* SECTION 2: LANGUAGE DETAILS FORM */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Languages className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Language Details
            </h2>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputField
                label="Language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="e.g., English, Arabic, Persian"
                icon={Languages}
                required
              />

              <SelectField
                label="Listening Proficiency"
                name="listening"
                value={formData.listening}
                onChange={handleChange}
                options={CEFR_LEVELS}
                icon={Volume2}
                required
              />

              <SelectField
                label="Reading Proficiency"
                name="reading"
                value={formData.reading}
                onChange={handleChange}
                options={CEFR_LEVELS}
                icon={BookOpen}
                required
              />

              <SelectField
                label="Writing Proficiency"
                name="writing"
                value={formData.writing}
                onChange={handleChange}
                options={CEFR_LEVELS}
                icon={PenTool}
                required
              />

              <SelectField
                label="Speaking Proficiency"
                name="speaking"
                value={formData.speaking}
                onChange={handleChange}
                options={CEFR_LEVELS}
                icon={MessageSquare}
                required
              />

              <InputField
                label="Document / Certificate Link"
                name="document_url"
                value={formData.document_url}
                onChange={handleChange}
                placeholder="https://example.com/certificate.pdf"
                icon={LinkIcon}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: LANGUAGE TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 overflow-hidden">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
          Language Competencies
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 rounded-lg">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg text-center">
                  Actions
                </th>
                <th className="px-4 py-3 font-semibold">Language</th>
                <th className="px-4 py-3 font-semibold">Speaking</th>
                <th className="px-4 py-3 font-semibold">Reading</th>
                <th className="px-4 py-3 font-semibold">Writing</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {languageHistory.map((lang) => (
                <tr
                  key={lang.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedItem(lang)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* View External Certificate */}
                      {lang.document_url && (
                        <a
                          href={lang.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title="View Certificate"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Attach/Edit Document */}
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentModal(
                            lang.id,
                            lang.language,
                            lang.document_url,
                          )
                        }
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          lang.document_url
                            ? "text-indigo-600 hover:bg-indigo-50"
                            : "text-blue-600 hover:bg-blue-50"
                        }`}
                        title={
                          lang.document_url ? "Update Document" : "Add Document"
                        }
                      >
                        <FilePlus className="w-4 h-4" />
                      </button>

                      {/* Delete Record */}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(lang.id)}
                        disabled={deletingId === lang.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                        title="Remove Language"
                      >
                        {deletingId === lang.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {lang.language}
                  </td>
                  <td className="px-4 py-3">
                    <ProficiencyBadge level={lang.speaking} />
                  </td>
                  <td className="px-4 py-3">
                    <ProficiencyBadge level={lang.reading} />
                  </td>
                  <td className="px-4 py-3">
                    <ProficiencyBadge level={lang.writing} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lang.created_by}
                  </td>
                </tr>
              ))}
              {languageHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No language records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW FULL DETAILS MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedItem.language}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Created by: {selectedItem.created_by}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Competencies */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    Listening
                  </span>
                  <div>
                    <ProficiencyBadge level={selectedItem.listening} />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    Reading
                  </span>
                  <div>
                    <ProficiencyBadge level={selectedItem.reading} />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-slate-400" />
                    Writing
                  </span>
                  <div>
                    <ProficiencyBadge level={selectedItem.writing} />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    Speaking
                  </span>
                  <div>
                    <ProficiencyBadge level={selectedItem.speaking} />
                  </div>
                </div>
              </div>

              {/* Document Link Card */}
              {selectedItem.document_url ? (
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs text-slate-600 truncate font-mono">
                      {selectedItem.document_url}
                    </span>
                  </div>
                  <a
                    href={selectedItem.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shrink-0 ml-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-center text-xs text-slate-400">
                  No certificate attached
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT MODAL */}
      {docModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleSaveDocument}>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocModalItem(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Attach Language Certificate
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Provide a link to the certificate or document for{" "}
                    <span className="font-semibold text-slate-700">
                      {docModalItem.language}
                    </span>
                    .
                  </p>
                </div>

                <InputField
                  label="Document URL"
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
                  onClick={() => setDocModalItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
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
                  Delete Language Record
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to remove this language entry? This
                  action cannot be undone.
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
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Proficiency Badge Component
function ProficiencyBadge({ level }: { level: string }) {
  // Extract level code (e.g. "B1" from "B1 - Intermediate")
  const code = level ? level.split(" ")[0] : "N/A";

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {code}
    </span>
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
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100/80 ${
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
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all cursor-pointer ${
            Icon ? "pl-9" : ""
          }`}
          {...props}
        >
          <option value="">Select Level...</option>
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
