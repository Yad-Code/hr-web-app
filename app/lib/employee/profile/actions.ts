// app/lib/employee/profile/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export async function addEducationAction(userId: string, formData: FormData) {
  // 1. CRITICAL: Check if userId is undefined before hitting the DB
  if (!userId) {
    throw new Error(
      "Missing userId. Make sure it is being passed from the component.",
    );
  }

  const level = formData.get("level") as string;
  const subject = formData.get("subject") as string;
  const institution = formData.get("institution") as string;

  // 2. Add fallbacks to ensure null instead of undefined/empty strings
  const location = (formData.get("location") as string) || null;
  const score = (formData.get("score") as string) || null;
  const start_year = formData.get("start_year")
    ? Number(formData.get("start_year"))
    : null;
  const end_year = formData.get("end_year")
    ? Number(formData.get("end_year"))
    : null;
  const document_url = (formData.get("document_url") as string) || null;

  if (!level || !subject || !institution) {
    throw new Error("Missing required fields");
  }

  await db`
    INSERT INTO education_history (
      user_id, level, subject, institution, location, score, start_year, end_year, document_url
    ) VALUES (
      ${userId}, ${level}, ${subject}, ${institution}, ${location}, ${score}, ${start_year}, ${end_year}, ${document_url}
    )
  `;

  revalidatePath("/dashboard/employee");
}

export async function updateEducationDocumentAction(
  id: string,
  documentUrl: string | null,
) {
  await db`
    UPDATE education_history
    SET document_url = ${documentUrl}
    WHERE id = ${id}
  `;

  revalidatePath("/dashboard/employee");
}

export async function deleteEducationAction(id: string) {
  await db`
    DELETE FROM education_history
    WHERE id = ${id}
  `;

  revalidatePath("/dashboard/employee");
}

// for adding languages

export async function addLanguageAction(
  userId: string,
  createdBy: string,
  formData: FormData,
) {
  if (!userId) {
    throw new Error("User ID is required to add a language record.");
  }

  const language = (formData.get("language") as string)?.trim();
  const listening = (formData.get("listening") as string)?.trim();
  const reading = (formData.get("reading") as string)?.trim();
  const writing = (formData.get("writing") as string)?.trim();
  const speaking = (formData.get("speaking") as string)?.trim();
  const document_url = (formData.get("document_url") as string)?.trim() || null;
  const author = createdBy?.trim() || "System Administrator";

  if (!language || !listening || !reading || !writing || !speaking) {
    throw new Error(
      "Missing required fields. Please select levels for all competencies.",
    );
  }

  await db`
    INSERT INTO employee_languages (
      user_id, language, listening, reading, writing, speaking, created_by, document_url
    ) VALUES (
      ${userId}, ${language}, ${listening}, ${reading}, ${writing}, ${speaking}, ${author}, ${document_url}
    )
  `;

  revalidatePath("/my-profile");
}

export async function updateLanguageDocumentAction(
  id: string,
  documentUrl: string | null,
) {
  await db`
    UPDATE employee_languages
    SET document_url = ${documentUrl}
    WHERE id = ${id}
  `;

  revalidatePath("/my-profile");
}

export async function deleteLanguageAction(id: string) {
  await db`
    DELETE FROM employee_languages
    WHERE id = ${id}
  `;

  revalidatePath("/my-profile");
}
