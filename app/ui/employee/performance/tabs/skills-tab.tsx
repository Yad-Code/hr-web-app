// app/ui/employee/performance/tabs/skills-tab.tsx
"use client";

import { useState, useTransition } from "react";
import { Skill } from "@/app/lib/performance/definitions";
import {
  updateSkillLevel,
  addSkill,
} from "@/app/lib/performance/actions/skills";

const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

interface LocalNewSkill {
  name: string;
  label: string;
  level: number;
}

export default function SkillsTab({ skills }: { skills: Skill[] }) {
  // Map of skill ID -> new pending level { [skillId]: number }
  const [pendingLevels, setPendingLevels] = useState<Record<string, number>>(
    {},
  );
  // List of locally added skills before saving
  const [pendingNewSkills, setPendingNewSkills] = useState<LocalNewSkill[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical");

  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const unsavedCount =
    Object.keys(pendingLevels).length + pendingNewSkills.length;
  const hasUnsavedChanges = unsavedCount > 0;

  // Track rating adjustments locally
  const handleRatingClick = (skillId: string, level: number) => {
    const originalSkill = skills.find((s) => s.id === skillId);

    // If rating is set back to original value, remove from pending map
    if (originalSkill && originalSkill.level === level) {
      setPendingLevels((prev) => {
        const next = { ...prev };
        delete next[skillId];
        return next;
      });
    } else {
      setPendingLevels((prev) => ({
        ...prev,
        [skillId]: level,
      }));
    }
  };

  // Add new skill to local state without touching the DB yet
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setPendingNewSkills((prev) => [
      ...prev,
      { name: newSkillName, label: newSkillCategory, level: 1 },
    ]);

    setNewSkillName("");
    setIsModalOpen(false);
  };

  // Dispatch all pending updates and creations batch-style on Save
  const handleSaveChanges = () => {
    setFeedbackMessage(null);

    startTransition(async () => {
      try {
        const levelUpdates = Object.entries(pendingLevels).map(
          ([skillId, level]) => updateSkillLevel(skillId, level),
        );

        const skillCreations = pendingNewSkills.map((skill) =>
          addSkill({
            name: skill.name,
            label: skill.label,
            level: skill.level,
          }),
        );

        await Promise.all([...levelUpdates, ...skillCreations]);

        setPendingLevels({});
        setPendingNewSkills([]);
        setFeedbackMessage({
          type: "success",
          text: "Skills and competencies saved successfully!",
        });
      } catch (err) {
        console.error("Failed to save skills:", err);
        setFeedbackMessage({
          type: "error",
          text: "Failed to save skill changes. Please try again.",
        });
      }
    });
  };

  const handleDiscard = () => {
    setPendingLevels({});
    setPendingNewSkills([]);
    setFeedbackMessage(null);
  };

  // Combine database skills and pending new skills for rendering
  const displaySkills = [
    ...skills.map((skill) => ({
      ...skill,
      level: pendingLevels[skill.id] ?? skill.level,
      isModified: skill.id in pendingLevels,
      isNew: false,
    })),
    ...pendingNewSkills.map((skill, index) => ({
      id: `temp-${index}`,
      ...skill,
      isModified: false,
      isNew: true,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800">Skills & Competencies</h3>
          <p className="text-xs text-slate-500">
            {hasUnsavedChanges
              ? `You have ${unsavedCount} unsaved skill update(s).`
              : "Adjust proficiency ratings or add skills, then click Save Changes when ready."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
          >
            + Add Skill
          </button>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isPending}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold ${
            feedbackMessage.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySkills.map((skill) => (
          <div
            key={skill.id}
            className={`p-4 bg-white border rounded-xl shadow-sm space-y-3 transition-all ${
              skill.isModified || skill.isNew
                ? "border-blue-400 ring-1 ring-blue-400/20"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{skill.name}</h4>
                  {(skill.isModified || skill.isNew) && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {skill.isNew ? "New Unsaved" : "Unsaved"}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                  {skill.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                {LEVEL_LABELS[skill.level] || `Level ${skill.level}`}
              </span>
            </div>

            {/* 1-5 Rating Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Proficiency:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    disabled={skill.isNew} // Pending new skills start at level 1 until saved
                    onClick={() =>
                      !skill.isNew && handleRatingClick(skill.id, level)
                    }
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      skill.level >= level
                        ? "bg-blue-600 text-white shadow-sm scale-105"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    } ${skill.isNew ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                    title={LEVEL_LABELS[level]}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Add New Skill</h3>

            <form onSubmit={handleAddSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, PostgreSQL, System Architecture"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category / Domain
                </label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technical">Technical / Engineering</option>
                  <option value="Architecture">Architecture & Design</option>
                  <option value="Soft Skills">Soft Skills & Leadership</option>
                  <option value="Tools">Tools & DevOps</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
