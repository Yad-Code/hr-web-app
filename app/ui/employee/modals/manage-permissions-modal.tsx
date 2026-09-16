// @/app/ui/employee/modals/manage-permissions-modal.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { X, ShieldAlert, Trash2, Plus, Loader2 } from "lucide-react";
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
}

export default function ManagePermissionsModal({
  isOpen,
  onClose,
  employee,
}: ManagePermissionsModalProps) {
  const [activePermissions, setActivePermissions] = useState<
    PermissionRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedScope, setSelectedScope] = useState("self");

  useEffect(() => {
    if (!isOpen || !employee?.id) return;

    let isMounted = true;

    const loadPermissions = async () => {
      try {
        const data = await getUserPermissions(employee.id);
        if (isMounted) {
          // 👇 FIX 1: Safely cast the Postgres RowList to our exact Interface
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
        // 👇 FIX 1: Safely cast the Postgres RowList here as well
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
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Grant New Permission Form */}
          <form
            onSubmit={handleGrant}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4"
          >
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Grant New Access
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  Action / Privilege
                </label>
                <select
                  name="actionName"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="view_dashboard">
                    View Dashboard Analytics
                  </option>
                  <option value="approve_leaves">Approve Leave Requests</option>
                  <option value="start_reviews">Start Formal Reviews</option>
                  <option value="log_feedback">Log Employee Feedback</option>
                  <option value="manage_system">
                    Manage Entire System (God Mode)
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  Access Scope
                </label>
                <select
                  name="scope"
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="self">Self (Own Data Only)</option>
                  <option value="team">Team (Direct Reports Only)</option>
                  <option value="department">Department</option>
                  <option value="branch">Branch / Province</option>
                  <option value="global">Global (Entire Enterprise)</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields based on ABAC Scope */}
            {selectedScope === "branch" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  Target Branch
                </label>
                <input
                  type="text"
                  name="targetBranch"
                  // 👇 FIX 2: Use intersection type instead of 'any'
                  defaultValue={
                    (employee as Employee & { branch?: string }).branch || ""
                  }
                  placeholder="e.g., Erbil Branch"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>
            )}

            {selectedScope === "department" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  Target Department
                </label>
                <input
                  type="text"
                  name="targetDepartment"
                  defaultValue={employee.department || ""}
                  placeholder="e.g., Engineering"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Grant Permission
              </button>
            </div>
          </form>

          {/* Active Permissions Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Active Assignments
            </h3>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : activePermissions.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                No special permissions assigned.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
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
                          {perm.action}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              perm.scope === "global"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : perm.scope === "branch"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {perm.scope}
                          </span>
                          {(perm.target_branch || perm.target_department) && (
                            <span className="block text-[10px] text-slate-500 mt-1 font-medium">
                              Target:{" "}
                              {perm.target_branch || perm.target_department}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
