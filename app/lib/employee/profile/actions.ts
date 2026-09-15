// app/lib/employee/profile/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { put } from "@vercel/blob";



export async function deleteEducationAction(id: string) {
  await db`
    DELETE FROM education_history
    WHERE id = ${id}
  `;

  revalidatePath("/dashboard/employee");
}

 
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

export async function addEducationAction(userId: string, formData: FormData) { 
  if (!userId) throw new Error("Missing userId.");

  const level = formData.get("level") as string;
  const subject = formData.get("subject") as string;
  const institution = formData.get("institution") as string;

  const location = (formData.get("location") as string) || null;
  const score = (formData.get("score") as string) || null;
  const start_year = formData.get("start_year") ? Number(formData.get("start_year")) : null;
  const end_year = formData.get("end_year") ? Number(formData.get("end_year")) : null;
  
  if (!level || !subject || !institution) {
    throw new Error("Missing required fields");
  }
 
  const file = formData.get("document_file") as File | null;
  let document_url = null;

  if (file && file.size > 0) {
    // Restrict size to 5MB
    if (file.size > 5 * 1024 * 1024) throw new Error("File must be smaller than 5MB");
    
    const blob = await put(`education/${userId}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`, file, {
      access: "public",
    });
    document_url = blob.url;
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
 
export async function updateEducationDocumentAction(id: string, formData: FormData) {
  const file = formData.get("document_file") as File | null;
  
  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > 5 * 1024 * 1024) throw new Error("File must be smaller than 5MB");

  const blob = await put(`education/doc-${id}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`, file, {
    access: "public",
  });

  await db`
    UPDATE education_history
    SET document_url = ${blob.url}
    WHERE id = ${id}
  `;

  revalidatePath("/dashboard/employee");
}