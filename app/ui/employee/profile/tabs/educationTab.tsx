"use client";

import React from "react";
import {
  GraduationCap,
  Save,
  RotateCcw,
  Trash2,
  FilePlus,
  MapPin,
  BookOpen,
  Building,
} from "lucide-react";
import { EducationTabProps } from "@/app/lib/employee/definitions";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ElementType;
}

export default function EducationTab({ educationHistory }: EducationTabProps) {
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

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField
              label="Education Level"
              placeholder="e.g., Bachelor, Master's"
              icon={GraduationCap}
            />
            <InputField
              label="Academic Subject"
              placeholder="e.g., Computer Engineering"
              icon={BookOpen}
            />
            <InputField
              label="Educational Institution"
              placeholder="University Name"
              icon={Building}
            />
            <InputField
              label="Location"
              placeholder="City, Country"
              icon={MapPin}
            />
            <InputField label="Score / GPA" placeholder="e.g., 3.8 or 96%" />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Start Year" type="number" placeholder="YYYY" />
              <InputField label="End Year" type="number" placeholder="YYYY" />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
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
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="Add Document"
                      >
                        <FilePlus className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
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
    </div>
  );
}

// Reusable Input Field Component
function InputField({
  label,
  type = "text",
  placeholder,
  icon: Icon,
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
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all ${Icon ? "pl-9" : ""}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
