"use client";

import { useActionState } from "react";
import { updateEmployeeProfile } from "@/app/lib/actions";
import { 
  Edit2, User, Mail, Phone, MapPin, 
  Droplet, Heart, Check, Loader2 
} from "lucide-react";
import { FullEmployeeProfile } from "@/app/lib/definitions";

interface ProfileFormProps {
  profile: FullEmployeeProfile;
  userEmail: string; 
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateEmployeeProfile, null);

  return (
    <form action={formAction}>
      {/* Hidden identifier fields */}
      <input type="hidden" name="email" value={userEmail} />
      <input type="hidden" name="employeeId" value={profile.employee_id || ""} />

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Edit2 className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Personal Information
          </h2>
          <span className="ml-auto text-[10px] text-blue-500 font-medium">Editable</span>
        </div>

        {/* Validation / Database Error Alert */}
        {state?.error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Name</p>
              <input
                type="text"
                name="preferredName"
                defaultValue={profile.preferred_name || profile.name}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {state?.fieldErrors?.preferredName && (
                <p className="text-[11px] text-rose-500 mt-1">{state.fieldErrors.preferredName[0]}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marital Status</p>
              <select
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</p>
              <select
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Email</p>
              <input
                type="email"
                name="personalEmail"
                defaultValue={profile.personal_email || profile.email}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {state?.fieldErrors?.personalEmail && (
                <p className="text-[11px] text-rose-500 mt-1">{state.fieldErrors.personalEmail[0]}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Phone</p>
              <input
                type="tel"
                name="personalPhone"
                defaultValue={profile.personal_phone || ""}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Address</p>
              <textarea
                name="currentAddress"
                defaultValue={profile.current_address || ""}
                rows={2}
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>
          </div>
        </div>

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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}