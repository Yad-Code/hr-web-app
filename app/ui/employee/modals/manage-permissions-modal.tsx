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
import { Employee } from "@/app/lib/employeeList/definitions";
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
  employee: Employee;
  initialTab?: "private" | "standard" | "public";
}

const actionLabels: Record<string, string> = {
  view_dashboard: "View Analytics & Dashboard",
  approve_leaves: "Approve Time-Off Requests",
  start_reviews: "Initiate Performance Reviews",
  log_feedback: "Log Continuous Feedback",
  manage_system: "System Administrator",
};

export default function ManagePermissionsModal({
  isOpen,
  onClose,
  employee,
  initialTab = "standard",
}: ManagePermissionsModalProps) {
  // initialTab is already set on mount right here!
  const [activeTab, setActiveTab] = useState<"private" | "standard" | "public">(
    initialTab,
  );
  const [activePermissions, setActivePermissions] = useState<
    PermissionRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedScope, setSelectedScope] = useState("self");

  useEffect(() => {
    if (!isOpen || !employee?.id) return;

    // 👇 FIX: Deleted the synchronous setActiveTab(initialTab) call that caused the error!

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
        const updated = await getUserPermissions(employee.id);
        setActivePermissions(updated as unknown as PermissionRecord[]);
      } else {
        alert(res.error);
      }
    });
  };

  const handleRevoke = (recordId: string) => {
    startTransition(async () => {
      const res = await revokePermission(recordId);
      if (res.success) {
        setActivePermissions((prev) =>
          prev.filter((p) => p.record_id !== recordId),
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
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
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5">
          <button
            onClick={() => setActiveTab("private")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "private"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Private
          </button>
          <button
            onClick={() => setActiveTab("standard")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "standard"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" /> Standard
          </button>
          <button
            onClick={() => setActiveTab("public")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "public"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Public
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto">
          {/* STANDARD PERMISSIONS TAB */}
          {activeTab === "standard" && (
            <div className="space-y-6 animate-fadeIn">
              <form
                onSubmit={handleGrant}
                className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">
                      Action / Privilege
                    </label>
                    <select
                      name="actionName"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                    >
                      <option value="view_dashboard">
                        View Analytics & Dashboard
                      </option>
                      <option value="approve_leaves">
                        Approve Time-Off Requests
                      </option>
                      <option value="start_reviews">
                        Initiate Performance Reviews
                      </option>
                      <option value="log_feedback">
                        Log Continuous Feedback
                      </option>
                      <option value="manage_system">
                        System Administrator
                      </option>
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
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                    >
                      <optgroup label="Management">
                        <option value="team">
                          Team Level (Direct Reports)
                        </option>
                      </optgroup>
                      <optgroup label="Organizational">
                        <option value="department">Department-Wide</option>
                        <option value="branch">Branch / Location-Wide</option>
                      </optgroup>
                      <optgroup label="Enterprise">
                        <option value="global">
                          Global (Full System Access)
                        </option>
                      </optgroup>
                    </select>
                  </div>
                </div>
                {selectedScope === "branch" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[11px] font-bold text-slate-600">
                      Target Branch
                    </label>
                    <input
                      type="text"
                      name="targetBranch"
                      defaultValue={
                        (employee as Employee & { branch?: string }).branch ||
                        ""
                      }
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                )}
                {selectedScope === "department" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[11px] font-bold text-slate-600">
                      Target Department
                    </label>
                    <input
                      type="text"
                      name="targetDepartment"
                      defaultValue={employee.department || ""}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Grant Dynamic Access
                  </button>
                </div>
              </form>

              {/* Dynamic Overrides Table */}
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              ) : activePermissions.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                  No dynamic permissions assigned.
                </div>
              ) : (
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
                      {activePermissions.map((perm) => (
                        <tr key={perm.record_id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {actionLabels[perm.action] || perm.action}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${perm.scope === "global" ? "bg-purple-50 text-purple-700 border-purple-200" : perm.scope === "branch" || perm.scope === "department" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                            >
                              {perm.scope}
                            </span>
                            {(perm.target_branch || perm.target_department) && (
                              <span className="block text-[10px] text-slate-500 mt-1.5 font-medium">
                                Target:{" "}
                                {perm.target_branch || perm.target_department}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRevoke(perm.record_id)}
                              disabled={isPending}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
 
          {activeTab === "private" && (
            <div className="animate-fadeIn p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-800">
                  Inherent Private Access
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                These permissions are automatically granted to the user for
                their own data. They cannot be revoked.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  View personal payslips & salary
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  Submit leave & WFH requests
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  Manage personal goals & skills
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  Complete self-assessments
                </li>
              </ul>
            </div>
          )}

          {/* PUBLIC PERMISSIONS TAB */}
          {activeTab === "public" && (
            <div className="animate-fadeIn p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-800">
                  Inherent Public Access
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                These read-only permissions are automatically granted to all
                active employees company-wide.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  View company directory
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  Read public job postings
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  View global shift rules
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />{" "}
                  Access company policies
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
