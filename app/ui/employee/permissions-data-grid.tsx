"use client";

import { useState } from "react";
import { Employee } from "@/app/lib/employeeList/definitions";
import ManagePermissionsModal from "./modals/manage-permissions-modal";

interface PermissionsDataGridProps {
  employees: Employee[];
}

export default function PermissionsDataGrid({
  employees,
}: PermissionsDataGridProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [activeModalTab, setActiveModalTab] = useState<
    "private" | "standard" | "public"
  >("standard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (
    employee: Employee,
    tab: "private" | "standard" | "public",
  ) => {
    setSelectedEmployee(employee);
    setActiveModalTab(tab);
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) { 
      alert("Delete action triggered for " + name);
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse whitespace-nowrap text-sm"> 
        <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300">
          <tr>
            <th className="p-2 border-r border-slate-300 w-16 text-center">
              Delete
            </th>
            <th className="p-2 border-r border-slate-300">
              User Private Permissions
            </th>
            <th className="p-2 border-r border-slate-300">Permissions</th>
            <th className="p-2 border-r border-slate-300">
              Public Permissions
            </th>
            <th className="p-2 border-r border-slate-300">Id</th>
            <th className="p-2 border-r border-slate-300">User Name</th>
            <th className="p-2 border-r border-slate-300">User Full Name</th>
            <th className="p-2">User Group</th>
          </tr>
        </thead>
 
        <tbody className="divide-y divide-slate-200 text-slate-700">
          {employees.map((emp, index) => (
            <tr key={emp.id} className="hover:bg-slate-50 transition-colors"> 
              <td className="p-2 border-r border-slate-200 text-center">
                <button
                  onClick={() => handleDelete(emp.name)}
                  className="px-2 py-1 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 font-medium text-xs shadow-xs"
                >
                  Delete
                </button>
              </td>
 
              <td className="p-2 border-r border-slate-200">
                <button
                  onClick={() => openModal(emp, "private")}
                  className="px-3 py-1 w-full text-left bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 font-medium text-xs shadow-xs"
                >
                  User Private Permissions
                </button>
              </td>
 
              <td className="p-2 border-r border-slate-200">
                <button
                  onClick={() => openModal(emp, "standard")}
                  className="px-3 py-1 w-full text-left bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 font-medium text-xs shadow-xs"
                >
                  Permissions
                </button>
              </td>
              
              <td className="p-2 border-r border-slate-200">
                <button
                  onClick={() => openModal(emp, "public")}
                  className="px-3 py-1 w-full text-left bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 font-medium text-xs shadow-xs"
                >
                  Public Permissions
                </button>
              </td>
 
              <td className="p-2 border-r border-slate-200 font-mono text-xs">
                {index + 1}
              </td>
              <td className="p-2 border-r border-slate-200">
                {emp.preferred_name || emp.email.split("@")[0]}
              </td>
              <td className="p-2 border-r border-slate-200 font-medium text-slate-900">
                {emp.name}
              </td>
 
              <td className="p-2 text-xs">
                {emp.department ? `${emp.department} - ${emp.role}` : emp.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
 
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
