import React from "react";
import { User, IdCard } from "lucide-react";
import { InputField } from "./formFields";

export function EmployeeInfoCard({
  employeeId,
  employeeName,
}: {
  employeeId?: string | null;
  employeeName?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <User className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Target Employee Details
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="Employee ID"
          value={employeeId ?? "N/A"}
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
  );
}
