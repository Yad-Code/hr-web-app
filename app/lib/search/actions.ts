"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export async function getGlobalSearchData() {
  try {
    const employees = await db`
      SELECT id, name, department, image_url, role 
      FROM users 
      ORDER BY name ASC
    `;

    return {
      success: true,
      employees: employees as unknown as {
        id: string;
        name: string;
        department: string;
        image_url: string;
        role: string;
      }[],
    };
  } catch (error) {
    console.error("[GLOBAL_SEARCH_ERROR]", error);
    return { success: false, employees: [] };
  }
}
