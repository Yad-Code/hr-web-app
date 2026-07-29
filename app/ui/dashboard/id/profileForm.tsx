// @/app/ui/dashboard/id/profileForm.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployeeProfile } from "@/app/lib/employeeList/actions";
import {
  Edit2,
  User,
  Mail,
  Briefcase,
  Shield,
  Activity,
  Check,
  Loader2,
  Heart,
  Droplet,
  Phone,
  MapPin,
} from "lucide-react";

// Extend the interface to include all fields
interface ProfileFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
    status?: string;
    preferred_name?: string;
    marital_status?: string;
    blood_group?: string;
    personal_email?: string;
    personal_phone?: string;
    current_address?: string;
  };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const updateProfileWithId = updateEmployeeProfile.bind(null, profile.id);
  const [state, formAction, isPending] = useActionState(
    updateProfileWithId,
    null,
  );

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!state?.success) return;

    router.refresh();

    const showTimer = setTimeout(() => setShowSuccess(true), 0);
    const hideTimer = setTimeout(() => setShowSuccess(false), 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* ---------------- SECTION 1: OFFICIAL DETAILS ---------------- */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Official Account Details
          </h2>
          <span className="ml-auto text-[10px] text-blue-500 font-medium">
            Admin Controlled
          </span>
        </div>

        {/* Global Success / Error Alerts */}
        {showSuccess && state?.success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            {state.message}
          </div>
        )}
        {state && !state.success && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
            {state.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="name"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Full Legal Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={profile.name}
                required
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="email"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={profile.email}
                required
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Briefcase className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="department"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                defaultValue={profile.department || ""}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="role"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                System Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={profile.role?.toLowerCase() || "employee"}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Activity className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="status"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={profile.status?.toLowerCase() || "active"}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 2: PERSONAL INFORMATION ---------------- */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Edit2 className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Personal Information
          </h2>
          <span className="ml-auto text-[10px] text-blue-500 font-medium">
            Editable
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="preferredName"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Preferred Name
              </label>
              <input
                id="preferredName"
                name="preferredName"
                type="text"
                defaultValue={profile.preferred_name || profile.name}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="maritalStatus"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Marital Status
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                defaultValue={profile.marital_status || "Single"}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Droplet className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="bloodGroup"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                defaultValue={profile.blood_group || "Unknown"}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="personalEmail"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Personal Email
              </label>
              <input
                id="personalEmail"
                name="personalEmail"
                type="email"
                defaultValue={profile.personal_email || ""}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="personalPhone"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Personal Phone
              </label>
              <input
                id="personalPhone"
                name="personalPhone"
                type="tel"
                defaultValue={profile.personal_phone || ""}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 md:col-span-2">
            <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <label
                htmlFor="currentAddress"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
              >
                Current Address
              </label>
              <textarea
                id="currentAddress"
                name="currentAddress"
                defaultValue={profile.current_address || ""}
                rows={2}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>
          </div>
        </div>

        {/* Global Submit Button */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
