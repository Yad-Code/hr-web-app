"use client";

import React from "react";

export interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultValue?: string | number | null;
  required?: boolean;
  mono?: boolean;
}

export function InputField({
  label,
  id,
  name,
  type = "text",
  icon: Icon,
  defaultValue,
  required,
  mono,
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
      >
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={`w-full text-xs sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

export type SelectOption = string | { label: string; value: string };

export interface SelectFieldProps {
  label: string;
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultValue?: string | number | null;
  options: SelectOption[];
}

export function SelectField({
  label,
  id,
  name,
  icon: Icon,
  defaultValue,
  options,
}: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
      >
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full text-xs sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const labelText = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {labelText}
            </option>
          );
        })}
      </select>
    </div>
  );
}
