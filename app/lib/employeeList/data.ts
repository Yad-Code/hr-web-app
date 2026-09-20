// @/app/lib/employeeList/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";

export async function getDirectoryEmployees(actorId: string) {
  try { 
    const adminCheck = await db`
      SELECT 1 FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = ${actorId}::uuid 
        AND p.action IN ('view_directory', 'manage_system', 'manage_system_access') 
        AND up.scope = 'global'
      LIMIT 1
    `;
    const hasAdminView = adminCheck.length > 0;

    const users = await db`
      WITH auth_users AS (
        SELECT DISTINCT u.id FROM users u
        JOIN user_permissions up ON up.user_id = ${actorId}::uuid
        JOIN permissions p ON p.id = up.permission_id 
        -- Visibility is now strictly locked to 'view_directory' or System Admin roles.
        WHERE p.action IN ('view_directory', 'manage_system', 'manage_system_access')
          AND (
            up.scope = 'global' OR
            (up.scope = 'branch' AND u.branch = up.target_branch) OR
            (up.scope = 'department' AND u.department = up.target_department) OR
            (up.scope = 'team' AND u.manager_id = ${actorId}::uuid)
          )
      )
      SELECT 
        id, name, preferred_name, email, department, branch, role, status, image_url
      FROM users 
      WHERE id IN (SELECT id FROM auth_users)
      ORDER BY name ASC
    `;

    const employees = users.map((user) => ({
      id: String(user.id),
      name: String(user.name),
      preferred_name: user.preferred_name ? String(user.preferred_name) : undefined,
      email: String(user.email),
      department: user.department ? String(user.department) : undefined,
      branch: user.branch ? String(user.branch) : undefined,
      role: String(user.role),
      status: String(user.status),
      image_url: user.image_url ? String(user.image_url) : null,
      last_seen_text: user.status === "Active" ? "Online" : "Offline",
    }));

    return { employees, hasAdminView };
  } catch (error) {
    console.error("Failed to fetch directory:", error);
    return { employees: [], hasAdminView: false };
  }
}

export async function getProfileById(id: string): Promise<FullEmployeeProfile | null> {
  if (!id) return null;

  try {
    const users = await db`
      SELECT u.*, m.name as fetched_manager_name 
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.id::text = ${id} OR u.employee_id = ${id} 
      LIMIT 1
    `;

    if (!users || users.length === 0) return null;

    const user = users[0];
    const historyRows = await db`
      SELECT title, company, period FROM employment_history WHERE user_id = ${user.id}::uuid ORDER BY created_at DESC
    `;

    return {
      id: String(user.id),
      userId: String(user.id),
      employee_id: user.employee_id || String(user.id).slice(0, 8),
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
      department: user.department || "General",
      branch: user.branch || "Main Branch",
      role: user.role || "employee",
      status: user.status || "Active",
      base_salary: user.base_salary ? Number(user.base_salary) : 3500.0,
      image_url: user.image_url || null,
      jobTitle: user.job_title || null,
      jobFamily: user.job_family || null,
      employmentType: user.employment_type || null,
      managerName: user.fetched_manager_name || null,
      managerId: user.manager_id || null,
      joinDate: user.join_date ? new Date(user.join_date).toISOString().split("T")[0] : null,
      shift_start: user.shift_start || "09:00:00",
      shift_end: user.shift_end || "17:00:00",
      shift_type: user.shift_type || "Standard (Mon - Fri)",
      publicOrg: user.public_org || null,
      privateOrg: user.private_org || null,
      insurance: user.insurance || null,
      subscription: user.subscription || null,
      last_seen_text: user.status === "Active" ? "Online" : "Offline",
      history: historyRows.map((row) => ({
        title: row.title,
        company: row.company || "Company",
        period: row.period,
      })),
    };
  } catch (error) {
    console.error("SQL Error in getProfileById:", error);
    return null;
  }
}

export async function getManagersDropdown() {
  try {
    const managers = await db`
      SELECT id, name, department 
      FROM users 
      WHERE role IN ('manager', 'admin') AND status = 'Active'
      ORDER BY name ASC
    `;
    return managers.map(m => ({ 
      id: String(m.id), 
      name: String(m.name), 
      department: String(m.department) 
    }));
  } catch (error) {
    console.error("Failed to fetch managers:", error);
    return [];
  }
}