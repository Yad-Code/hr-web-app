// @/app/(admin)/dashboard/(overview)/employees/EmployeeSearchList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  ShieldAlert,
  Table,
  LayoutList,
  Filter,
} from "lucide-react"; 
import { Employee } from "@/app/lib/employeeList/definitions";
import ManagePermissionsModal from "@/app/ui/employee/modals/manage-permissions-modal";
import PermissionsDataGrid from "@/app/ui/employee/permissions-data-grid";

interface EmployeeSearchListClientProps {
  initialEmployees: Employee[];
  canDelete?: boolean;
  canManageAccess?: boolean;
}

export function EmployeeSearchListClient({
  initialEmployees,
  canDelete = false,
  canManageAccess = false,
}: EmployeeSearchListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "list">("list");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const departments = [
    "All",
    ...Array.from(
      new Set(initialEmployees.map((e) => e.department).filter(Boolean)),
    ),
  ];

  const filteredEmployees = initialEmployees.filter((employee) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.department?.toLowerCase().includes(query);

    // 👇 FIXED: Apply the dropdown filter logic
    const matchesDepartment =
      selectedDepartment === "All" ||
      employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const activeCount = initialEmployees.filter(
    (e) => e.status?.toLowerCase() === "active",
  ).length;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 sm:pr-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* 👇 FIXED: Grouped Search and Dropdown Filter together */}
        <div className="flex flex-col sm:flex-row items-center w-full md:w-auto flex-1 gap-2 px-2">
          <div className="relative w-full sm:max-w-xs flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or email..."
              className="block w-full pl-9 pr-10 py-2.5 text-sm bg-transparent border-none placeholder-slate-400 text-slate-900 focus:ring-0 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all hover:bg-slate-100 appearance-none pr-9"
            >
              {departments.map((dept) => (
                <option key={dept as string} value={dept as string}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto px-4 md:px-0 pb-2 md:pb-0 gap-4">
          {canManageAccess && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Data Grid View"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Card View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              {activeCount} Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 ring-1 ring-slate-200/50 whitespace-nowrap">
              {initialEmployees.length - activeCount} Offline
            </span>
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center">
          <Search className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            {selectedDepartment !== "All"
              ? `No team members found in ${selectedDepartment} matching "${searchQuery}"`
              : `No team members found matching "${searchQuery}"`}
          </p>
        </div>
      ) : viewMode === "table" && canManageAccess ? (
        <PermissionsDataGrid
          employees={filteredEmployees}
          canDelete={canDelete}
          canManageAccess={canManageAccess}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredEmployees.map((employee) => {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=f1f5f9&color=64748b`;
            const isActive = employee.status?.toLowerCase() === "active";

            return (
              <div
                key={employee.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-md hover:border-indigo-200/60 transition-all gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-12 h-12 rounded-full shrink-0 ring-2 ring-slate-50 group-hover:ring-indigo-50 transition-all">
                    <Image
                      src={employee.image_url || fallbackAvatar}
                      alt={employee.name}
                      fill
                      className="object-cover rounded-full bg-slate-100"
                      sizes="48px"
                      unoptimized
                    />
                    <span
                      className={`absolute bottom-0 right-0 block w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                        isActive ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                        {employee.name}
                      </h2>
                      {employee.role?.toLowerCase() === "admin" && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-rose-50 text-rose-600 rounded-md ring-1 ring-rose-200/50 shrink-0">
                          Admin
                        </span>
                      )}
                      {employee.role?.toLowerCase() === "manager" && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-indigo-50 text-indigo-600 rounded-md ring-1 ring-indigo-200/50 shrink-0">
                          Manager
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {employee.email}
                      </p>
                      {employee.department && (
                        <>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {employee.department}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-16 sm:pl-0 border-t border-slate-50 sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                  <span
                    className={`text-xs font-bold ${
                      isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {employee.last_seen_text}
                  </span>

                  <div className="flex items-center gap-2">
                    {canManageAccess && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all shadow-xs cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Manage Access
                      </button>
                    )}

                    <Link
                      href={`/dashboard/employees/${employee.id}/edit`}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-xs"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedEmployee && viewMode === "list" && (
        <ManagePermissionsModal
          isOpen={isModalOpen}
          employee={selectedEmployee}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}
