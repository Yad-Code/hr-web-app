// @/app/(admin)/dashboard/(overview)/performance/reviews/new/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? "Saving Review..." : "Submit Formal Review"}
    </button>
  );
}
