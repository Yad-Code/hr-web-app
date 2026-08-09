import React, { useState, useRef } from "react";
import {
  Upload,
  RotateCcw,
  Loader2,
  Save,
  FileText,
  Tag,
  Link as LinkIcon,
} from "lucide-react";
import { InputField, SelectField } from "./formFields";

const CATEGORY_TITLES_MAP: Record<string, string[]> = {
  Identification: [
    "National ID Card",
    "Passport Copy",
    "Driving License",
    "Residence Permit",
  ],
  "Contract / Legal": [
    "Employment Contract",
    "Non-Disclosure Agreement (NDA)",
    "Job Offer Letter",
    "Contract Amendment",
  ],
  "Payroll / Tax": [
    "Tax Declaration Form",
    "Direct Deposit Authorization",
    "Bank Details Confirmation",
  ],
  "Medical / Insurance": [
    "Health Insurance Card",
    "Medical Fitness Certificate",
    "Vaccination Record",
  ],
  Certificates: [
    "University Degree",
    "Professional Certification",
    "Training Completion Certificate",
  ],
  Other: ["General Document", "Custom Reference Letter"],
};

export function UploadDocumentForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: {
    title: string;
    category: string;
    file_url: string;
  }) => void;
  isPending: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialFormState = { title: "", category: "", file_url: "" };
  const [formData, setFormData] = useState(initialFormState);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category,
      title: "", // Reset title selection when category changes
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => setFormData(initialFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleReset();
  };

  const availableTitles = formData.category
    ? CATEGORY_TITLES_MAP[formData.category] || []
    : [];

  return (
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
          <SelectField
            label="Document Category"
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
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
          <SelectField
            label="Document Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            icon={FileText}
            options={availableTitles}
            disabled={!formData.category}
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
  );
}
