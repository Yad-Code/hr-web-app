// @/app/lib/employee/profile/data.ts

import { sql as db } from "@/app/lib/employeeDashboard/employee/db"; // Adjust path to match your project
import { EducationItem } from "@/app/lib/employee/definitions";

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