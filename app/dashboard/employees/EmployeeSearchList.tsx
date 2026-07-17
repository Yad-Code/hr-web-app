"use client";

import * as React from "react";
import Image from "next/image";
import { Employee } from "@/app/lib/data";

interface EmployeeSearchListProps {
  initialEmployees: Employee[];
}

export function EmployeeSearchList({ initialEmployees }: EmployeeSearchListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Instantaneous case-insensitive client-side filter
  const filteredEmployees = initialEmployees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = initialEmployees.filter(e => e.status === 'active').length;

  return (
    <>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="text-left">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Presence</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status activity logs.</p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {activeCount} Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {initialEmployees.length - activeCount} Offline
          </span>
        </div>
      </div>

      {/* Modern Search Input Container */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* Minimalist Search Lens SVG */}
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees by name or email..."
          className="block w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {/* Clear "X" Close Button */}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Conditional List Render */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">No team members found matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredEmployees.map((employee) => {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=f1f5f9&color=64748b`;
            const isActive = employee.status === 'active';

            return (
              <div 
                key={employee.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors active:bg-slate-50 sm:active:bg-transparent"
              >
                {/* Employee Card Body */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-11 h-11 rounded-full flex-shrink-0">
                    <Image
                      src={employee.image_url || fallbackAvatar}
                      alt={employee.name}
                      fill
                      className="object-cover rounded-full bg-slate-100"
                      sizes="44px"
                    />
                    <span className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-white ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                        {employee.name}
                      </h2>
                      {employee.role === 'admin' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-rose-50 text-rose-600 rounded border border-rose-100 flex-shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                      {employee.email}
                    </p>
                  </div>
                </div>

                {/* Status Timestamp Column */}
                <div className="text-right shrink-0 pl-2">
                  <span className={`text-xs font-semibold ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 font-medium'
                  }`}>
                    {employee.last_seen_text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}