import React from "react";

export function ProficiencyBadge({ level }: { level: string }) {
  const code = level ? level.split(" ")[0] : "N/A";

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {code}
    </span>
  );
}

export function InputField({
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

export function SelectField({
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
