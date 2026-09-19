// @/app/lib/employee/profile/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import {
  EducationItem,
  LanguageItem,
  EmployeeDocument,
} from "@/app/lib/employee/definitions";

export async function getEducationData(
  userId: string,
): Promise<EducationItem[]> {
  try {
    return await db<EducationItem[]>`
      SELECT 
        id, level, subject, institution, location, score, start_year, end_year, document_url
      FROM education_history
      WHERE user_id = ${userId}::uuid
      ORDER BY end_year DESC NULLS LAST;
    `;
  } catch (error) {
    console.error("Failed to fetch education history:", error);
    return [];
  }
}

export async function getLanguageData(userId: string): Promise<LanguageItem[]> {
  try {
    return await db<LanguageItem[]>`
      SELECT 
        id, user_id, language, listening, reading, writing, speaking, created_by, document_url, created_at
      FROM employee_languages
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error("Failed to fetch language data:", error);
    return [];
  }
}

export async function getEmployeeDocumentsData(
  userId: string,
): Promise<EmployeeDocument[]> {
  try {
    return await db<EmployeeDocument[]>`
      SELECT 
        id, user_id, file_name AS title, document_type AS category, file_url, created_at::text AS uploaded_at
      FROM employee_documents
      WHERE user_id = ${userId}::uuid 
      AND document_type NOT IN ('Employment Contract', 'Tax Form', 'Compensation Letter', 'Policy Agreement', 'Degree Certificate')
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    return [];
  }
}
