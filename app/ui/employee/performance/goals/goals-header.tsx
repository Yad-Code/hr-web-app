// app/ui/employee/performance/components/goals-header.tsx
"use client";

interface GoalsHeaderProps {
  unsavedCount: number;
  hasUnsavedChanges: boolean;
  isPending: boolean;
  onOpenModal: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export default function GoalsHeader({
  unsavedCount,
  hasUnsavedChanges,
  isPending,
  onOpenModal,
  onDiscard,
  onSave,
}: GoalsHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
      <div>
        <h3 className="font-bold text-slate-800">Goal Progress</h3>
        <p className="text-xs text-slate-500">
          {hasUnsavedChanges
            ? `You have ${unsavedCount} unsaved goal change(s).`
            : "Adjust goal sliders or create new goals, then click Save Changes."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenModal}
          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
        >
          + Add Goal
        </button>

        {hasUnsavedChanges && (
          <button
            type="button"
            onClick={onDiscard}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            Discard
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isPending}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}