// app/ui/employee/performance/tabs/skills-tab.tsx
"use client";

import { useState, useTransition, useOptimistic } from "react";
import { Skill } from "@/app/lib/performance/definitions";
import {
  updateSkillLevel,
  addSkill,
  deleteSkill,
} from "@/app/lib/performance/actions/skills";
import AddSkillModal, {
  NewSkillData,
} from "@/app/ui/employee/performance/modals/add-skill-modal";

const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};



export default function SkillsTab({ skills }: { skills: Skill[] }) {
  const [isPending, startTransition] = useTransition();

  // Optimistic list for zero-latency state rendering

  const [optimisticSkills, setOptimisticSkills] = useOptimistic(
    skills,
    (
      currentSkills,
      action: {
        type: "COMMIT_ALL";
        pendingLevels: Record<string, number>;
        pendingNewSkills: NewSkillData[];
        pendingDeletions: string[];
      },
    ) => {
      // 1. Filter out deleted skills
      const remaining = currentSkills.filter(
        (s) => !action.pendingDeletions.includes(s.id),
      );

      // 2. Apply level updates
      const updatedExisting = remaining.map((s) => ({
        ...s,
        level: action.pendingLevels[s.id] ?? s.level,
      }));

      // 3. Append new skills
      const createdSkills: Skill[] = action.pendingNewSkills.map((s, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        user_id: "temp",
        name: s.name,
        label: s.label,
        level: s.level,
      }));

      return [...updatedExisting, ...createdSkills];
    },
  );

  const [pendingLevels, setPendingLevels] = useState<Record<string, number>>(
    {},
  );
  const [pendingNewSkills, setPendingNewSkills] = useState<NewSkillData[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const unsavedCount =
    Object.keys(pendingLevels).length +
    pendingNewSkills.length +
    pendingDeletions.length;
  const hasUnsavedChanges = unsavedCount > 0;

  // Toggle skill deletion
  const handleDeleteClick = (
    skillId: string,
    isNew: boolean,
    index?: number,
  ) => {
    if (isNew && index !== undefined) {
      // Unsaved new skill: discard immediately from local state
      setPendingNewSkills((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // Saved database skill: toggle pending deletion state
    setPendingDeletions((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const handleRatingClick = (skillId: string, level: number) => {
    const originalSkill = optimisticSkills.find((s) => s.id === skillId);

    if (originalSkill && originalSkill.level === level) {
      setPendingLevels((prev) => {
        const next = { ...prev };
        delete next[skillId];
        return next;
      });
    } else {
      setPendingLevels((prev) => ({ ...prev, [skillId]: level }));
    }
  };

  const handleAddSkill = (newSkill: NewSkillData) => {
    setPendingNewSkills((prev) => [...prev, newSkill]);
  };

  const handleSaveChanges = () => {
    setFeedbackMessage(null);

    const levelsToUpdate = { ...pendingLevels };
    const skillsToAdd = [...pendingNewSkills];
    const idsToDelete = [...pendingDeletions];

    // Reset local staging variables
    setPendingLevels({});
    setPendingNewSkills([]);
    setPendingDeletions([]);

    startTransition(async () => {
      // Apply updates optimistically to UI
      setOptimisticSkills({
        type: "COMMIT_ALL",
        pendingLevels: levelsToUpdate,
        pendingNewSkills: skillsToAdd,
        pendingDeletions: idsToDelete,
      });

      try {
        const levelUpdates = Object.entries(levelsToUpdate).map(
          ([skillId, level]) => updateSkillLevel(skillId, level),
        );
        const skillCreations = skillsToAdd.map((skill) => addSkill(skill));
        const skillDeletions = idsToDelete.map((skillId) =>
          deleteSkill(skillId),
        );

        await Promise.all([
          ...levelUpdates,
          ...skillCreations,
          ...skillDeletions,
        ]);

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
    setPendingDeletions([]);
    setFeedbackMessage(null);
  };

  // I was looking for this----------------------------->
  // Combine optimistic skills + local unsaved edits
  const displaySkills = [
    ...optimisticSkills.map((skill) => ({
      ...skill,
      level: pendingLevels[skill.id] ?? skill.level,
      isModified: skill.id in pendingLevels,
      isDeleted: pendingDeletions.includes(skill.id),
      isNew: false,
      tempIndex: undefined,
    })),
    ...pendingNewSkills.map((skill, index) => ({
      id: `temp-${index}`,
      tempIndex: index,
      ...skill,
      isModified: false,
      isDeleted: false,
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
              ? `You have ${unsavedCount} unsaved change(s).`
              : "Adjust proficiency ratings, add, or remove skills, then click Save Changes."}
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
            className={`p-4 bg-white border rounded-xl shadow-sm space-y-3 transition-all relative ${
              skill.isDeleted
                ? "bg-red-50/50 border-red-300 opacity-60"
                : skill.isModified || skill.isNew
                  ? "border-blue-400 ring-1 ring-blue-400/20"
                  : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-bold text-slate-900 ${
                      skill.isDeleted ? "line-through text-slate-500" : ""
                    }`}
                  >
                    {skill.name}
                  </h4>
                  {skill.isDeleted ? (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      To be deleted
                    </span>
                  ) : (
                    (skill.isModified || skill.isNew) && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {skill.isNew ? "New Unsaved" : "Unsaved"}
                      </span>
                    )
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                  {skill.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  {LEVEL_LABELS[skill.level] || `Level ${skill.level}`}
                </span>

                {/* Delete / Undo Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteClick(skill.id, skill.isNew, skill.tempIndex)
                  }
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    skill.isDeleted
                      ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title={skill.isDeleted ? "Undo delete" : "Delete skill"}
                >
                  {skill.isDeleted ? (
                    <span className="text-[11px] font-semibold px-1">Undo</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 1-5 Rating Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Proficiency:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    disabled={skill.isNew || skill.isDeleted}
                    onClick={() =>
                      !skill.isNew &&
                      !skill.isDeleted &&
                      handleRatingClick(skill.id, level)
                    }
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      skill.level >= level
                        ? "bg-blue-600 text-white shadow-sm scale-105"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    } ${
                      skill.isNew || skill.isDeleted
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
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

      <AddSkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
}
