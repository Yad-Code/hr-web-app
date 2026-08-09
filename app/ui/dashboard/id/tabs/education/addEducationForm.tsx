import React, { useState, useRef } from "react";
import {
  GraduationCap,
  BookOpen,
  Building,
  MapPin,
  Link as LinkIcon,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";
import { InputField, SelectField } from "./formFields";

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

export function AddEducationForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (formData: Record<string, string>) => void;
  isPending: boolean;
}) {
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

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    setFormData((prev) => ({
      ...prev,
      level,
      subject: "", // Reset subject when level changes
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

  const availableSubjects = formData.level
    ? EDUCATION_SUBJECTS_MAP[formData.level] || []
    : [];

  return (
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
  );
}
