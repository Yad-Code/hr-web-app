// @/app/ui/employee/permissions-data-grid.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2, Lock, Settings2, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner"; // 👈 FIXED: Imported toast
import { Employee } from "@/app/lib/employeeList/definitions";
import ManagePermissionsModal from "./modals/manage-permissions-modal";
import { deleteEmployeeAction } from "@/app/lib/employeeList/actions";

interface PermissionsDataGridProps {
  employees: Employee[];
  canDelete?: boolean; // 👈 FIXED: Added the prop
}

export default function PermissionsDataGrid({
  employees,
  canDelete = false, // 👈 FIXED: Default fallback
}: PermissionsDataGridProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [activeModalTab, setActiveModalTab] = useState<
    "private" | "standard" | "public"
  >("standard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const openModal = (
    employee: Employee,
    tab: "private" | "standard" | "public",
  ) => {
    setSelectedEmployee(employee);
    setActiveModalTab(tab);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `Are you absolutely sure you want to permanently delete ${name} from the system?`,
      )
    ) {
      startTransition(async () => {
        const res = await deleteEmployeeAction(id);
        if (!res.success) {
          toast.error(res.error || "Failed to delete employee."); // 👈 FIXED: Replaced alert with toast
        } else {
          toast.success("Employee permanently deleted.");
        }
      });
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                User Name
              </th>
              <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                User Group
              </th>
              <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Private Access
              </th>
              <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Dynamic Permissions
              </th>
              <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Public Access
              </th>
              {/* 👇 FIXED: Conditionally render the Action header */}
              {canDelete && (
                <th className="px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-5 py-3 font-bold text-slate-900">
                  {emp.preferred_name || emp.email.split("@")[0]}
                </td>
                <td className="px-5 py-3 text-slate-600 font-medium">
                  {emp.name}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60 shadow-xs">
                    {emp.department
                      ? `${emp.department} - ${emp.role}`
                      : emp.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => openModal(emp, "private")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Private
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => openModal(emp, "standard")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg hover:bg-indigo-100 transition-all shadow-xs cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Manage
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => openModal(emp, "public")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400" /> Public
                  </button>
                </td>
                {/* 👇 FIXED: Conditionally render the Delete button cell */}
                {canDelete && (
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(emp.id, emp.name)}
                      disabled={isPending}
                      title={`Delete ${emp.name}`}
                      className="inline-flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedEmployee && (
        <ManagePermissionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={selectedEmployee}
          initialTab={activeModalTab}
        />
      )}
    </div>
  );
}
