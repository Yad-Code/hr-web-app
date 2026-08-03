// @/app/ui/dashboard/id/tabs/language/types.ts

export interface LanguageEntry {
  id: string;
  user_id: string;
  language: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
  created_by: string;
  document_url?: string | null;
  created_at?: string;
}

export const CEFR_LEVELS = [
  "A1 - Beginner",
  "A2 - Elementary",
  "B1 - Intermediate",
  "B2 - Upper Intermediate",
  "C1 - Advanced",
  "C2 - Mastery",
  "Native / Fluent",
];
