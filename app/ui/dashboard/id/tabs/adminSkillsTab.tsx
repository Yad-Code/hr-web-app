// @/app/ui/dashboard/id/tabs/adminSkillsTab.tsx
"use client";

import React from "react";
import { Skill } from "@/app/lib/employeeDashboard/performance/definitions";

const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

interface AdminSkillsTabProps {
  skills: Skill[]; 
}

export default function AdminSkillsTab({ skills }: AdminSkillsTabProps) {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {skills.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            No skills recorded for this employee.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{skill.name}</h4>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                    {skill.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  {LEVEL_LABELS[skill.level] || `Level ${skill.level}`}
                </span>
              </div>

              {/* Rating representation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Proficiency:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center ${
                        skill.level >= level
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
