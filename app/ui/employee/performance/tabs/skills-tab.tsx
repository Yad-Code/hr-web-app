// app/ui/employee/performance/tabs/skills-tab.tsx
"use client";

import { useTransition } from "react";
import { Skill } from "@/app/lib/performance/definitions";
import { updateSkillLevel } from "@/app/lib/performance/actions/skills";

export default function SkillsTab({ skills }: { skills: Skill[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSkillUpdate = (skillId: string, level: number) => {
    startTransition(async () => {
      await updateSkillLevel(skillId, level); // Uses the server action[cite: 9]
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">My Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">{skill.name}</p>
              <p className="text-sm text-slate-500">{skill.label}</p>
            </div>
            <div className="flex items-center gap-2">
               {/* Quick 1-5 rating selector for skill level */}
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleSkillUpdate(skill.id, level)}
                  disabled={isPending}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    skill.level >= level ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}