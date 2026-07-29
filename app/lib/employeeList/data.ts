// app/lib/employeeList/data.ts
import { sql } from "@/app/lib/employeeDashboard/employee/db";

export async function getProfileById(id: string) {
  if (!id) return null;

  try {
    // Queries against PK `id` (UUID) or custom `employee_id` (VARCHAR)
    const users = await sql`
      SELECT * 
      FROM users 
      WHERE id::text = ${id} OR employee_id = ${id}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      console.warn(
        `⚠️ [getProfileById] No user matched ID/employee_id '${id}'`,
      );
      return null;
    }

    const user = users[0];

    return {
      id: String(user.id),
      userId: String(user.id),
      employee_id: user.employee_id || String(user.id).slice(0, 8),
      name: user.name,
      preferred_name: user.preferred_name || user.name,
      department: user.department || "General",
      branch: user.branch || "Main Branch",
      date_of_birth: user.date_of_birth || null,
      age: user.age || null,
      gender: user.gender || "N/A",
      nationality: user.nationality || "N/A",
      marital_status: user.marital_status || "Single",
      blood_group: user.blood_group || "Unknown",
      email: user.email,
      personal_email: user.personal_email || user.email,
      personal_phone: user.personal_phone || "",
      current_address: user.current_address || "",
      role: user.role || "employee",
      status: user.status || "Active",
      image_url: user.image_url || null,
      shift_start: user.shift_start || "09:00:00",
      shift_end: user.shift_end || "17:00:00",
      shift_type: user.shift_type || "Standard (Mon - Fri)",
    };
  } catch (error) {
    console.error("❌ [getProfileById] SQL Error:", error);
    return null;
  }
}
