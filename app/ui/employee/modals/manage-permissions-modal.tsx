// @/app/ui/employee/modals/manage-permissions-modal.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X,
  ShieldAlert,
  Trash2,
  Plus,
  Loader2,
  Lock,
  Globe,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserPermissions,
  grantPermission,
  revokePermission,
} from "@/app/lib/admin/permissions/actions";

export interface PermissionRecord {
  record_id: string;
  action: string;
  description: string;
  scope: string;
  target_branch: string | null;
  target_department: string | null;
}

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    department?: string | null;
    branch?: string | null;
  };
  initialTab?: "private" | "standard" | "public";
}

const actionLabels: Record<string, string> = {
  view_dashboard: "View Analytics & Dashboard",
  approve_leaves: "Approve Time-Off Requests",
  start_reviews: "Initiate Performance Reviews",
  log_feedback: "Log Continuous Feedback",
  manage_system: "System Administrator",
  edit_personal_profile: "Edit Personal Profile",
  submit_requests: "Submit Leave Requests",
  view_payroll: "View Personal Payslips",
  view_directory: "View Directory & Presence",
  view_policies: "Access Company Policies",
  create_records: "Create System Records",
  update_records: "Update System Records",
  delete_records: "Delete System Records",
  export_system_data: "Export System Data",
  manage_reports: "Manage Reports",
  manage_security_policies: "Manage Security Policies",
  manage_user_credentials: "Manage User Credentials",
  manage_system_access: "Manage System Access",
};

export default function ManagePermissionsModal({
  isOpen,
  onClose,
  employee,
  initialTab = "standard",
}: ManagePermissionsModalProps) {
  const [activeTab, setActiveTab] = useState<"private" | "standard" | "public">(
    initialTab,
  );
  const [activePermissions, setActivePermissions] = useState<
    PermissionRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedScope, setSelectedScope] = useState("team");

  useEffect(() => {
    if (!isOpen || !employee?.id) return;

    let isMounted = true;
    const loadPermissions = async () => {
      try {
        const data = await getUserPermissions(employee.id);
        if (isMounted) {
          setActivePermissions(data as unknown as PermissionRecord[]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setIsLoading(false);
      }
    };
    loadPermissions();
    return () => {
      isMounted = false;
      setIsLoading(true);
    };
  }, [isOpen, employee?.id]);

  if (!isOpen) return null;

  const handleGrant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("userId", employee.id);

    startTransition(async () => {
      const res = await grantPermission(formData);
      if (res.success) {
        toast.success("Permission granted successfully!");
        const updated = await getUserPermissions(employee.id);
        setActivePermissions(updated as unknown as PermissionRecord[]);
      } else {
        toast.error(res.error || "Failed to grant permission.");
      }
    });
  };

  const handleRevoke = (recordId: string) => {
    startTransition(async () => {
      const res = await revokePermission(recordId);
      if (res.success) {
        toast.success("Permission revoked.");
        setActivePermissions((prev) =>
          prev.filter((p) => p.record_id !== recordId),
        );
      } else {
        toast.error(res.error || "Failed to revoke permission.");
      }
    });
  };

  const privatePerms = activePermissions.filter((p) => p.scope === "self");
  const publicPerms = activePermissions.filter((p) => p.scope === "global");
  const standardPerms = activePermissions.filter((p) =>
    ["team", "department", "branch"].includes(p.scope),
  );

  const renderTable = (perms: PermissionRecord[]) => {
    if (isLoading) {
      return (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
        </div>
      );
    }
    if (perms.length === 0) {
      return (
        <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
          No permissions assigned in this category.
        </div>
      );
    }
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Permission Action</th>
              <th className="px-4 py-3">Scope Boundary</th>
              <th className="px-4 py-3 text-center">Revoke</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {perms.map((perm) => (
              <tr key={perm.record_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {actionLabels[perm.action] || perm.action}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${perm.scope === "global" ? "bg-purple-50 text-purple-700 border-purple-200" : perm.scope === "branch" || perm.scope === "department" ? "bg-blue-50 text-blue-700 border-blue-200" : perm.scope === "team" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                  >
                    {perm.scope}
                  </span>
                  {(perm.target_branch || perm.target_department) && (
                    <span className="block text-[10px] text-slate-500 mt-1.5 font-medium">
                      Target: {perm.target_branch || perm.target_department}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleRevoke(perm.record_id)}
                    disabled={isPending}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Access Management
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configuring scopes for {employee.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 px-5">
          <button
            onClick={() => setActiveTab("private")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "private" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Lock className="w-3.5 h-3.5" /> Private
          </button>
          <button
            onClick={() => setActiveTab("standard")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "standard" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Settings2 className="w-3.5 h-3.5" /> Standard
          </button>
          <button
            onClick={() => setActiveTab("public")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "public" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Globe className="w-3.5 h-3.5" /> Public
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {activeTab === "private" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Inherent Private Access
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  These baseline permissions are granted to all active employees
                  by default, but can be manually revoked or overridden by an
                  Administrator.
                </p>
              </div>
              <form
                onSubmit={handleGrant}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4"
              >
                <input type="hidden" name="scope" value="self" />
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Assign Action for Personal Data
                    </label>
                    <select
                      name="actionName"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-500/20 bg-white cursor-pointer"
                    >
                      <option value="edit_personal_profile">
                        Edit Personal Profile
                      </option>
                      <option value="submit_requests">
                        Submit Leave Requests
                      </option>
                      <option value="view_payroll">
                        View Personal Payslips
                      </option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 h-[38px] text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}{" "}
                    Assign Private Role
                  </button>
                </div>
              </form>
              {renderTable(privatePerms)}
            </div>
          )}

          {activeTab === "standard" && (
            <div className="space-y-6 animate-fadeIn">
              <form
                onSubmit={handleGrant}
                className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">
                      Action / Privilege
                    </label>
                    <select
                      name="actionName"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer"
                    >
                      <optgroup label="Access & Visibility">
                        <option value="view_directory">
                          View Directory & Presence
                        </option>
                        <option value="view_dashboard">
                          View Analytics & Dashboard
                        </option>
                      </optgroup>

                      <optgroup label="Security & Administration">
                        <option value="manage_system_access">
                          Manage System Access
                        </option>
                      </optgroup>

                      <optgroup label="Data & Reporting">
                        <option value="create_records">
                          Create System Records
                        </option>
                        <option value="update_records">
                          Update System Records
                        </option>
                        <option value="delete_records">
                          Delete System Records
                        </option>
                        <option value="export_system_data">
                          Export System Data
                        </option>
                        <option value="manage_reports">Manage Reports</option>
                      </optgroup>

                      <optgroup label="HR & Performance">
                        <option value="approve_leaves">
                          Approve Time-Off Requests
                        </option>
                        <option value="start_reviews">
                          Initiate Performance Reviews
                        </option>
                        <option value="log_feedback">
                          Log Continuous Feedback
                        </option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">
                      Access Scope
                    </label>
                    <select
                      name="scope"
                      value={selectedScope}
                      onChange={(e) => setSelectedScope(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer"
                    >
                      <option value="team">Team Level (Direct Reports)</option>
                      <option value="department">Department-Wide</option>
                      <option value="branch">Branch / Location-Wide</option>
                    </select>
                  </div>
                </div>

                {selectedScope === "branch" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[11px] font-bold text-slate-600">
                      Target Branch
                    </label>
                    <select
                      name="targetBranch"
                      defaultValue={employee.branch || ""}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Branch...
                      </option>
                      <option value="HQ - Sulaymaniyah">
                        HQ - Sulaymaniyah
                      </option>
                      <option value="Erbil Branch">Erbil Branch</option>
                      <option value="Duhok Branch">Duhok Branch</option>
                      <option value="Basra Branch">Basra Branch</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                )}
                {selectedScope === "department" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[11px] font-bold text-slate-600">
                      Target Department
                    </label>
                    <select
                      name="targetDepartment"
                      defaultValue={employee.department || ""}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Department...
                      </option>
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}{" "}
                    Grant Standard Access
                  </button>
                </div>
              </form>
              {renderTable(standardPerms)}
            </div>
          )}

          {activeTab === "public" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Inherent Public Access
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  These baseline permissions are granted to all active employees
                  by default.
                </p>
              </div>
              <form
                onSubmit={handleGrant}
                className="bg-purple-50/50 border border-purple-200/60 rounded-xl p-4"
              >
                <input type="hidden" name="scope" value="global" />
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[11px] font-bold text-purple-700">
                      Assign Global Enterprise Action
                    </label>
                    <select
                      name="actionName"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 bg-white cursor-pointer"
                    >
                      <optgroup label="System & Security">
                        <option value="manage_system">
                          Full System Administrator
                        </option>
                        <option value="manage_security_policies">
                          Manage Security Policies
                        </option>
                        <option value="manage_user_credentials">
                          Manage User Credentials
                        </option>
                        <option value="manage_system_access">
                          Manage System Access
                        </option>
                      </optgroup>
                      <optgroup label="Basic Global Access">
                        <option value="view_directory">
                          View Global Company Directory
                        </option>
                        <option value="view_policies">
                          Access Company Policies
                        </option>
                      </optgroup>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 h-[38px] text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}{" "}
                    Assign Global Role
                  </button>
                </div>
              </form>
              {renderTable(publicPerms)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
