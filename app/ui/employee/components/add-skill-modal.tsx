// app/ui/employee/performance/components/add-skill-modal.tsx
"use client";

import { ModalWrapper } from "@/app/ui/components/modal-wrapper";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;

    if (!name.trim()) return;

    onAddSkill({ name: name.trim(), label: category, level: 1 });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add New Skill">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Skill Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Next.js, PostgreSQL, System Architecture"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Category / Domain
          </label>
          <select
            id="category"
            name="category"
            defaultValue="Technical"
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
    </ModalWrapper>
  );
}
