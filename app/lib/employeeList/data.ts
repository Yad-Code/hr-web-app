// app/lib/employeeList/data.ts
import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions"; // Adjust import path if needed

export async function getProfileById(
  id: string,
): Promise<FullEmployeeProfile | null> {
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
      // Core Identifiers
      id: String(user.id),
      userId: String(user.id),
      employee_id: user.employee_id || String(user.id).slice(0, 8),

      // Personal Info
      name: user.name,
      preferred_name: user.preferred_name || user.name,
      email: user.email,
      personal_email: user.personal_email || user.email,
      personal_phone: user.personal_phone || "",
      current_address: user.current_address || "",
      date_of_birth: user.date_of_birth || null,
      age: user.age || null,
      gender: user.gender || "N/A",
      nationality: user.nationality || "N/A",
      marital_status: user.marital_status || "Single",
      blood_group: user.blood_group || "Unknown",

      // Organization & Administrative
      department: user.department || "General",
      branch: user.branch || "Main Branch",
      role: user.role || "employee",
      status: user.status || "Active",
      base_salary: user.base_salary ? Number(user.base_salary) : 3500.0,
      image_url: user.image_url || null,

      // Job & Shift Details
      jobTitle: user.job_title || null,
      jobFamily: user.job_family || null,
      employmentType: user.employment_type || null,
      managerName: user.manager_name || null,
      joinDate: user.join_date
        ? new Date(user.join_date).toISOString().split("T")[0]
        : null,
      shift_start: user.shift_start || "09:00:00",
      shift_end: user.shift_end || "17:00:00",
      shift_type: user.shift_type || "Standard (Mon - Fri)",

      // Benefits & History
      publicOrg: user.public_org || null,
      privateOrg: user.private_org || null,
      insurance: user.insurance || null,
      subscription: user.subscription || null,
    };
  } catch (error) {
    console.error("❌ [getProfileById] SQL Error:", error);
    return null;
  }
}
