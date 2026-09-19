// @/app/lib/employee/profile/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAccess } from "@/app/lib/auth/access-control";

// --- EDUCATION ACTIONS ---

export async function addEducationAction(
  targetUserId: string,
  formData: FormData,
) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId)
      return { success: false, error: "Unauthorized. Please log in." };

    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "update_records";
    if (!(await verifyAccess(actorId, requiredAction, targetUserId))) {
      return {
        success: false,
        error: "Forbidden: You lack permission to add education records.",
      };
    }

    const level = formData.get("level") as string;
    const subject = formData.get("subject") as string;
    const institution = formData.get("institution") as string;
    const location = formData.get("location") as string;
    const score = formData.get("score") as string;
    const startYear = formData.get("startYear")
      ? Number(formData.get("startYear"))
      : null;
    const endYear = formData.get("endYear")
      ? Number(formData.get("endYear"))
      : null;

    if (!level || !institution || !startYear) {
      return { success: false, error: "Please fill in all required fields." };
    }

    await db`
      INSERT INTO education_history (user_id, level, subject, institution, location, score, start_year, end_year)
      VALUES (${targetUserId}::uuid, ${level}, ${subject}, ${institution}, ${location}, ${score}, ${startYear}, ${endYear})
    `;

    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Add Education Error:", error);
    return {
      success: false,
      error: "Failed to add education record to the database.",
    };
  }
}

export async function deleteEducationAction(recordId: string) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId)
      return { success: false, error: "Unauthorized. Please log in." };

    const rec =
      await db`SELECT user_id FROM education_history WHERE id = ${recordId}::uuid`;
    if (!rec.length) return { success: false, error: "Record not found." };

    const targetUserId = rec[0].user_id as string;
    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "delete_records";

    if (!(await verifyAccess(actorId, requiredAction, targetUserId))) {
      return {
        success: false,
        error: "Forbidden: You lack permission to delete this record.",
      };
    }

    await db`DELETE FROM education_history WHERE id = ${recordId}::uuid`;
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Delete Education Error:", error);
    return { success: false, error: "Failed to delete education record." };
  }
}

export async function updateEducationDocumentAction(
  recordId: string,
  formData: FormData,
) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId)
      return { success: false, error: "Unauthorized. Please log in." };

    const rec =
      await db`SELECT user_id FROM education_history WHERE id = ${recordId}::uuid`;
    if (!rec.length) return { success: false, error: "Record not found." };

    const targetUserId = rec[0].user_id as string;
    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "update_records";

    if (!(await verifyAccess(actorId, requiredAction, targetUserId))) {
      return {
        success: false,
        error: "Forbidden: You lack permission to update this document.",
      };
    }

    const documentUrl = formData.get("documentUrl") as string;

    await db`UPDATE education_history SET document_url = ${documentUrl} WHERE id = ${recordId}::uuid`;
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Update Education Doc Error:", error);
    return { success: false, error: "Failed to update document link." };
  }
}

// --- LANGUAGE ACTIONS ---

export async function addLanguageAction(
  targetUserId: string,
  employeeName: string,
  formData: FormData,
) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId)
      return { success: false, error: "Unauthorized. Please log in." };

    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "update_records";
    if (!(await verifyAccess(actorId, requiredAction, targetUserId))) {
      return {
        success: false,
        error: "Forbidden: You lack permission to add language records.",
      };
    }

    const language = formData.get("language") as string;
    const listening = formData.get("listening") as string;
    const reading = formData.get("reading") as string;
    const writing = formData.get("writing") as string;
    const speaking = formData.get("speaking") as string;

    if (!language) {
      return { success: false, error: "Language name is required." };
    }

    const creatorName =
      actorId === targetUserId ? employeeName : "System Administrator";

    await db`
      INSERT INTO employee_languages (user_id, language, listening, reading, writing, speaking, created_by)
      VALUES (${targetUserId}::uuid, ${language}, ${listening}, ${reading}, ${writing}, ${speaking}, ${creatorName})
    `;

    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Add Language Error:", error);
    return { success: false, error: "Failed to add language record." };
  }
}

export async function deleteLanguageAction(recordId: string) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId)
      return { success: false, error: "Unauthorized. Please log in." };

    const rec =
      await db`SELECT user_id FROM employee_languages WHERE id = ${recordId}::uuid`;
    if (!rec.length) return { success: false, error: "Record not found." };

    const targetUserId = rec[0].user_id as string;
    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "delete_records";

    if (!(await verifyAccess(actorId, requiredAction, targetUserId))) {
      return {
        success: false,
        error: "Forbidden: You lack permission to delete this record.",
      };
    }

    await db`DELETE FROM employee_languages WHERE id = ${recordId}::uuid`;
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Delete Language Error:", error);
    return { success: false, error: "Failed to delete language record." };
  }
}

export async function updateLanguageDocumentAction(
  recordId: string,
  urlToSave: string | null,
) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId)
      return { success: false, error: "Unauthorized. Please log in." };

    const rec =
      await db`SELECT user_id FROM employee_languages WHERE id = ${recordId}::uuid`;
    if (!rec.length) return { success: false, error: "Record not found." };

    const targetUserId = rec[0].user_id as string;
    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "update_records";

    if (!(await verifyAccess(actorId, requiredAction, targetUserId))) {
      return {
        success: false,
        error: "Forbidden: You lack permission to update this document.",
      };
    }

    await db`UPDATE employee_languages SET document_url = ${urlToSave} WHERE id = ${recordId}::uuid`;
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Update Language Doc Error:", error);
    return { success: false, error: "Failed to update language document." };
  }
}
