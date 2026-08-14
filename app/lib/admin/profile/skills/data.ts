// @/app/lib/admin/profile/skills/data.ts
import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { Skill } from "@/app/lib/employeeDashboard/performance/definitions";

export async function getEmployeeSkills(employeeId: string): Promise<Skill[]> {
  try {
    const skills = await sql<Skill[]>`
      SELECT * FROM skills
      WHERE user_id = ${employeeId}
    `;
    return skills;
  } catch (error) {
    console.error("Failed to fetch employee skills:", error);
    return [];
  }
}
