// @/app/ui/dashboard/id/adminEducationTab.tsx
"use client";

import React, { useState, useTransition, useRef } from "react";
import {
  GraduationCap,
  Save,
  RotateCcw,
  Trash2,
  FilePlus,
  MapPin,
  BookOpen,
  Building,
  Loader2,
  AlertTriangle,
  X,
  FileText,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  Calendar,
  Award,
  ShieldCheck,
} from "lucide-react";
import { EducationTabProps } from "@/app/lib/employee/definitions";
import {
  addEducationAction,
  deleteEducationAction,
  updateEducationDocumentAction,
} from "@/app/lib/employee/profile/actions";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
}

interface AdminEducationTabProps extends EducationTabProps {
  userId: string;
}

export default function AdminEducationTab({
  educationHistory,
  userId,
}: AdminEducationTabProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal States[cite: 4]
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [docModalItem, setDocModalItem] = useState<{
    id: string;
    level: string;
    currentUrl?: string | null;
  } | null>(null);
  const [documentUrlInput, setDocumentUrlInput] = useState("");

  // State for the View Full Details Modal[cite: 4]
  const [selectedItem, setSelectedItem] = useState<
    AdminEducationTabProps["educationHistory"][number] | null
  >(null);

  const formRef = useRef<HTMLFormElement>(null);

  const initialFormState = {
    level: "",
    subject: "",
    institution: "",
    location: "",
    score: "",
    start_year: "",
    end_year: "",
    document_url: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        await addEducationAction(userId, data);
        handleReset();
      } catch (err) {
        console.error("Failed to add education entry:", err);
      }
    });
  };

  // Confirm and proceed with deletion[cite: 4]
  const confirmDelete = () => {
    if (!itemToDelete) return;

    const id = itemToDelete;
    setItemToDelete(null);
    setDeletingId(id);

    startTransition(async () => {
      try {
        await deleteEducationAction(id);
      } catch (err) {
        console.error("Failed to delete education entry:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  // Open Document Modal prefilled with current URL if present[cite: 4]
  const openDocumentModal = (
    id: string,
    level: string,
    currentUrl?: string | null,
  ) => {
    setDocModalItem({ id, level, currentUrl });
    setDocumentUrlInput(currentUrl || "");
  };

  // Save Document URL from modal[cite: 4]
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docModalItem) return;

    const targetId = docModalItem.id;
    const urlToSave = documentUrlInput.trim() || null;

    setDocModalItem(null);
    startTransition(async () => {
      try {
        await updateEducationDocumentAction(targetId, urlToSave);
      } catch (err) {
        console.error("Failed to update document URL:", err);
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
            Admin Education Management
          </h2>
        </div>
        <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          Target Employee ID: {userId || "N/A"}
        </span>
      </div>

      {/* SECTION 1: ADD EDUCATION FORM */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Add Education Record
          </h2>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField
              label="Education Level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="e.g., Bachelor, Master's"
              icon={GraduationCap}
              required
            />
            <InputField
              label="Academic Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Computer Engineering"
              icon={BookOpen}
              required
            />
            <InputField
              label="Educational Institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="University Name"
              icon={Building}
              required
            />
            <InputField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              icon={MapPin}
            />
            <InputField
              label="Score / GPA"
              name="score"
              value={formData.score}
              onChange={handleChange}
              placeholder="e.g., 3.8 or 96%"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Start Year"
                name="start_year"
                type="number"
                value={formData.start_year}
                onChange={handleChange}
                placeholder="YYYY"
              />
              <InputField
                label="End Year"
                name="end_year"
                type="number"
                value={formData.end_year}
                onChange={handleChange}
                placeholder="YYYY"
              />
            </div>
          </div>

          <InputField
            label="Document URL / Certificate Link"
            name="document_url"
            value={formData.document_url}
            onChange={handleChange}
            placeholder="https://example.com/certificate.pdf"
            icon={LinkIcon}
          />

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
              Save Record
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: EDUCATION HISTORY TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 overflow-hidden">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
          Education History Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 rounded-lg">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">
                  Education Level
                </th>
                <th className="px-4 py-3 font-semibold">Academic Subject</th>
                <th className="px-4 py-3 font-semibold">Institution</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {educationHistory.map((edu) => (
                <tr
                  key={edu.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {edu.level}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{edu.subject}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {edu.institution}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{edu.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Details Button[cite: 4] */}
                      <button
                        type="button"
                        onClick={() => setSelectedItem(edu)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* View Document Link (If exists)[cite: 4] */}
                      {edu.document_url && (
                        <a
                          href={edu.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title="View Document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Attach/Edit Document Button[cite: 4] */}
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentModal(edu.id, edu.level, edu.document_url)
                        }
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          edu.document_url
                            ? "text-indigo-600 hover:bg-indigo-50"
                            : "text-blue-600 hover:bg-blue-50"
                        }`}
                        title={
                          edu.document_url ? "Update Document" : "Add Document"
                        }
                      >
                        <FilePlus className="w-4 h-4" />
                      </button>

                      {/* Delete Entry Button[cite: 4] */}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(edu.id)}
                        disabled={deletingId === edu.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        {deletingId === edu.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {educationHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No education history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW FULL DETAILS MODAL[cite: 4] */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedItem.level}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedItem.subject}
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

              {/* Detail Items Grid[cite: 4] */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    Institution
                  </span>
                  <p className="font-medium text-slate-800">
                    {selectedItem.institution}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Location
                  </span>
                  <p className="font-medium text-slate-800">
                    {selectedItem.location || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Score / GPA
                  </span>
                  <p className="font-medium text-slate-800">
                    {selectedItem.score || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Duration
                  </span>
                  <p className="font-medium text-slate-800">
                    {selectedItem.start_year || selectedItem.end_year
                      ? `${selectedItem.start_year || "—"} - ${
                          selectedItem.end_year || "Present"
                        }`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Document Link Card[cite: 4] */}
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
                  No document attached
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

      {/* FORMAL DOCUMENT ATTACH / EDIT MODAL[cite: 4] */}
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
                    Attach Education Document
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Provide a link to the diploma, degree, or certificate for{" "}
                    <span className="font-semibold text-slate-700">
                      {docModalItem.level}
                    </span>
                    .
                  </p>
                </div>

                <InputField
                  label="Document URL"
                  type="url"
                  placeholder="https://example.com/document.pdf"
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
                  className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMAL CONFIRMATION DELETE MODAL[cite: 4] */}
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
                  Delete Education Record
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to remove this entry from your education
                  history? This action cannot be undone.
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
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Input Field Component[cite: 4]
function InputField({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  ...props
}: InputFieldProps) {
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
