"use client";

import React from "react";
import { FullEmployeeProfile } from "@/app/lib/employeeList/definitions";
import { InputField, SelectField } from "./formFields";
import { Edit2, User, Heart, Droplet, Mail, Phone, MapPin } from "lucide-react";

export default function PersonalInfoSection({
  profile,
}: {
  profile: FullEmployeeProfile;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Edit2 className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Personal Information
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
          Editable
        </span>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <InputField
          label="Preferred Name"
          id="preferredName"
          name="preferredName"
          icon={User}
          defaultValue={profile.preferred_name || profile.name}
        />

        <SelectField
          label="Marital Status"
          id="maritalStatus"
          name="maritalStatus"
          icon={Heart}
          defaultValue={profile.marital_status || "Single"}
          options={["Single", "Married", "Divorced", "Widowed"]}
        />

        <SelectField
          label="Blood Group"
          id="bloodGroup"
          name="bloodGroup"
          icon={Droplet}
          defaultValue={profile.blood_group || "Unknown"}
          options={[
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-",
            "Unknown",
          ]}
        />

        <InputField
          label="Personal Email"
          id="personalEmail"
          name="personalEmail"
          type="email"
          icon={Mail}
          defaultValue={profile.personal_email}
        />

        <InputField
          label="Personal Phone"
          id="personalPhone"
          name="personalPhone"
          type="tel"
          icon={Phone}
          defaultValue={profile.personal_phone}
        />

        <div className="space-y-1">
          <label
            htmlFor="currentAddress"
            className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Current Address
          </label>
          <textarea
            id="currentAddress"
            name="currentAddress"
            defaultValue={profile.current_address || ""}
            rows={3}
            className="w-full text-xs sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
          />
        </div>
      </div>
    </div>
  );
}
