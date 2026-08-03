// @/app/lib/employee/profile/data.ts

import { sql as db } from "@/app/lib/employeeDashboard/employee/db"; // Adjust path to match your project
import { EducationItem } from "@/app/lib/employee/definitions";
import { LanguageItem } from "@/app/lib/employee/definitions";

export async function getEducationData(userId: string) {
  try {
    const educationRecords = await db`
      SELECT 
        id,
        level,
        subject,
        institution,
        location,
        score,
        start_year,
        end_year,
        document_url
      FROM education_history
      WHERE user_id = ${userId}
      ORDER BY end_year DESC NULLS LAST;
    `;

    return educationRecords as unknown as EducationItem[];
  } catch (error) {
    console.error("Failed to fetch education history:", error);
    return [];
  }
}

export async function getLanguageData(userId: string): Promise<LanguageItem[]> {
  try {
    const data = await db`
      SELECT 
        id,
        user_id,
        language,
        listening,
        reading,
        writing,
        speaking,
        created_by,
        document_url,
        created_at
      FROM employee_languages
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    
    return data as unknown as LanguageItem[]; 
  } catch (error) {
    console.error("Failed to fetch language data:", error);
    return [];
  }
}