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
  AlertCircle,
  X,
  FileText,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  Calendar,
  Award,
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

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  icon?: React.ElementType;
  placeholder?: string;
}

interface ExtendedEducationTabProps extends EducationTabProps {
  userId: string;
}

const EDUCATION_SUBJECTS_MAP: Record<string, string[]> = {
  "High School": ["High School Diploma", "General Secondary Education"],
  "Bachelor's Degree": [
    "Computer Engineering",
    "Software Engineering",
    "Information Technology",
    "Electrical Engineering",
    "Business Administration",
    "Finance",
  ],
  "Master's Degree": [
    "Master of Computer Science",
    "Master of Business Administration (MBA)",
    "Data Science & Analytics",
    "Cyber Security",
    "Software Architecture",
  ],
  "Ph.D. / Doctorate": [
    "Ph.D. in Computer Science",
    "Ph.D. in Software Engineering",
    "Ph.D. in Electrical Engineering",
  ],
  "Diploma / Certificate": [
    "Full-Stack Web Development Bootcamp",
    "Network Engineering Diploma",
    "UI/UX Design Certificate",
    "Project Management Professional (PMP)",
  ],
};

export default function EducationTab({
  educationHistory,
  userId,
}: ExtendedEducationTabProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [docModalItem, setDocModalItem] = useState<{
    id: string;
    level: string;
    currentUrl?: string | null;
  } | null>(null);
  const [documentUrlInput, setDocumentUrlInput] = useState("");

  // State for the View Full Details Modal
  const [selectedItem, setSelectedItem] = useState<
    ExtendedEducationTabProps["educationHistory"][number] | null
  >(null);

  const formRef = useRef<HTMLFormElement>(null);

  const initialFormState = {
    level: "",
    subject: "",
    institution: "",
    location: "",
    score_type: "GPA",
    score: "",
    start_year: "",
    end_year: "",
    document_url: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    setFormData((prev) => ({
      ...prev,
      level,
      subject: "", // Reset subject when level changes
    }));
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "score_type") {
        updated.score = "";
      }
      return updated;
    });
    setError(null);
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Start and End Years
    if (!formData.start_year || !formData.end_year) {
      setError("Validation Error: Both Start Year and End Year are required.");
      return;
    }

    const start = parseInt(formData.start_year, 10);
    const end = parseInt(formData.end_year, 10);
    if (start > end) {
      setError(
        "Validation Error: The end year cannot be earlier than the start year.",
      );
      return;
    }

    // Validate Score Range
    if (formData.score !== "") {
      const numericScore = parseFloat(formData.score);
      if (isNaN(numericScore)) {
        setError(
          "Validation Error: Please enter a valid numeric value for the score.",
        );
        return;
      }

      if (formData.score_type === "GPA") {
        if (numericScore < 0 || numericScore > 4.0) {
          setError(
            "Validation Error: GPA must be within the valid range of 0.0 to 4.0.",
          );
          return;
        }
      } else if (formData.score_type === "Percentage") {
        if (numericScore < 0 || numericScore > 100) {
          setError(
            "Validation Error: Percentage must be within the valid range of 0 to 100.",
          );
          return;
        }
      }
    }

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

  // Confirm and proceed with deletion
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

  // Open Document Modal prefilled with current URL if present
  const openDocumentModal = (
    id: string,
    level: string,
    currentUrl?: string | null,
  ) => {
    setDocModalItem({ id, level, currentUrl });
    setDocumentUrlInput(currentUrl || "");
  };

  // Save Document URL from modal
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

  const availableSubjects = formData.level
    ? EDUCATION_SUBJECTS_MAP[formData.level] || []
    : [];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* SECTION 1: EDUCATION DETAILS FORM */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Education Details
          </h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SelectField
              label="Education Level"
              name="level"
              value={formData.level}
              onChange={handleLevelChange}
              icon={GraduationCap}
              options={[
                "High School",
                "Bachelor's Degree",
                "Master's Degree",
                "Ph.D. / Doctorate",
                "Diploma / Certificate",
              ]}
              required
            />
            <SelectField
              label="Academic Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              icon={BookOpen}
              options={availableSubjects}
              disabled={!formData.level}
              placeholder={
                formData.level
                  ? "Select Subject..."
                  : "Select Education Level first"
              }
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

            {/* Score Type & Dynamic Score Input */}
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Score Type"
                name="score_type"
                value={formData.score_type}
                onChange={handleChange}
                options={["GPA", "Percentage"]}
              />
              <InputField
                label={
                  formData.score_type === "GPA"
                    ? "GPA (0 - 4.0)"
                    : "Percentage (%)"
                }
                name="score"
                type="number"
                step="any"
                value={formData.score}
                onChange={handleChange}
                placeholder={
                  formData.score_type === "GPA" ? "e.g., 3.8" : "e.g., 95"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Start Year"
                name="start_year"
                type="number"
                value={formData.start_year}
                onChange={handleChange}
                placeholder="YYYY"
                required
              />
              <InputField
                label="End Year"
                name="end_year"
                type="number"
                value={formData.end_year}
                onChange={handleChange}
                placeholder="YYYY"
                required
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

      {/* SECTION 2: EDUCATION HISTORY TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 overflow-hidden">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
          Education History
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
                      <button
                        type="button"
                        onClick={() => setSelectedItem(edu)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

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

      {/* VIEW FULL DETAILS MODAL */}
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

      {/* DOCUMENT ATTACH / EDIT MODAL */}
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
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE MODAL */}
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

// Reusable Input Field Component
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
  placeholder = "Select Option...",
  ...props
}: SelectFieldProps) {
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
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all cursor-pointer disabled:opacity-60 disabled:bg-slate-100/80 ${
            Icon ? "pl-9" : ""
          }`}
          {...props}
        >
          <option value="">{placeholder}</option>
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
