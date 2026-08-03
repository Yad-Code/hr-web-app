import React, { useState, useRef } from "react";
import {
  Languages,
  Volume2,
  BookOpen,
  PenTool,
  MessageSquare,
  Link as LinkIcon,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";
import { InputField, SelectField } from "./formFields";
import { CEFR_LEVELS } from "./types";

export function AddLanguageForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (formData: Record<string, string>) => void;
  isPending: boolean;
}) {
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => setFormData(initialFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleReset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Languages className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Add Language Competency
        </h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InputField
            label="Language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="e.g., English, Arabic, Kurdish"
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
            label="Certificate / Document Link"
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
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Add Language Entry
          </button>
        </div>
      </form>
    </div>
  );
}
