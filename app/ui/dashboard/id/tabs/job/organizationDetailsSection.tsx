import React from "react";
import { Building, Building2, ShieldCheck, UserCheck } from "lucide-react";
import { InputField } from "./formControls";

export function OrganizationDetailsSection({
  formData,
  onChange,
}: {
  formData: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Building className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Organization Details
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <InputField
          label="Public Organization"
          name="publicOrg"
          value={formData.publicOrg}
          onChange={onChange}
          icon={Building}
          placeholder="—"
        />
        <InputField
          label="Private Organization"
          name="privateOrg"
          value={formData.privateOrg}
          onChange={onChange}
          icon={Building2}
          placeholder="e.g. ABC Tech"
        />
        <InputField
          label="Insurance"
          name="insurance"
          value={formData.insurance}
          onChange={onChange}
          icon={ShieldCheck}
          placeholder="Insurance Provider"
        />
        <InputField
          label="Subscription"
          name="subscription"
          value={formData.subscription}
          onChange={onChange}
          icon={UserCheck}
          placeholder="e.g. Standard"
        />
      </div>
    </div>
  );
}
