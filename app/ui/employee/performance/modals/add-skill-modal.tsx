// app/ui/employee/performance/components/add-skill-modal.tsx
"use client";

import { useState } from "react";

export interface NewSkillData {
  name: string;
  label: string;
  level: number;
}

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: NewSkillData) => void;
}

export default function AddSkillModal({
  isOpen,
  onClose,
  onAddSkill,
}: AddSkillModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Technical");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSkill({
      name: name.trim(),
      label: category,
      level: 1,
    });

    // Reset local state and close modal
    setName("");
    setCategory("Technical");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-md space-y-4">
        <h3 className="font-bold text-lg text-slate-800">Add New Skill</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js, PostgreSQL, System Architecture"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category / Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}