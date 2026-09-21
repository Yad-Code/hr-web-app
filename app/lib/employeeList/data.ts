// @/app/lib/employeeList/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { FullEmployeeProfile } from "@/app/lib/employee/definitions";
import { auth } from "@/auth";   

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
      preferred_name: user.preferred_name
        ? String(user.preferred_name)
        : undefined,
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

export async function getProfileById(
  id: string,
): Promise<FullEmployeeProfile | null> {
  if (!id) return null;

  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return null;
  
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

      gender: user.gender || null,
      nationality: user.nationality || null,
      marital_status: user.marital_status || null,
      blood_group: user.blood_group || null,
      department: user.department || null,
      branch: user.branch || null,
      role: user.role || null,
      status: user.status || null,
      base_salary: user.base_salary ? Number(user.base_salary) : 0,
      image_url: user.image_url || null,
      jobTitle: user.job_title || null,
      jobFamily: user.job_family || null,
      employmentType: user.employment_type || null,
      managerName: user.fetched_manager_name || null,
      managerId: user.manager_id || null,
      joinDate: user.join_date
        ? new Date(user.join_date).toISOString().split("T")[0]
        : null,
      shift_start: user.shift_start || null,
      shift_end: user.shift_end || null,
      shift_type: user.shift_type || null,
      publicOrg: user.public_org || null,
      privateOrg: user.private_org || null,
      insurance: user.insurance || null,
      subscription: user.subscription || null,
      last_seen_text: user.status === "Active" ? "Online" : "Offline",
      history: historyRows.map((row) => ({
        title: row.title,
        company: row.company || null,
        period: row.period,
      })),
    };
  } catch (error) {
    console.error("SQL Error in getProfileById:", error);
    return null;
  }
}

export async function getManagersDropdown(actorId: string) {
  if (!actorId) return [];

  try {
    const managers = await db`
      WITH params AS (
        SELECT ${actorId}::uuid AS actor_id
      ),
      auth_users AS (
        SELECT DISTINCT u.id FROM users u
        CROSS JOIN params
        JOIN user_permissions up ON up.user_id = params.actor_id
        JOIN permissions p ON p.id = up.permission_id
        WHERE p.action = 'view_directory'
          AND (
            up.scope = 'global' OR
            (up.scope = 'branch' AND u.branch = up.target_branch) OR
            (up.scope = 'department' AND u.department = up.target_department) OR
            (up.scope = 'team' AND u.manager_id = params.actor_id)
          )
      )
      SELECT DISTINCT u.id, u.name, u.department 
      FROM users u 
      JOIN user_permissions up ON up.user_id = u.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE u.status = 'Active' 
        AND p.action IN ('approve_leaves', 'start_reviews', 'manage_system')
        AND u.id IN (SELECT id FROM auth_users)
      ORDER BY u.name ASC
    `;

    return managers.map((m) => ({
      id: String(m.id),
      name: String(m.name),
      department: m.department ? String(m.department) : "Unassigned",
    }));
  } catch (error) {
    console.error("Failed to fetch managers:", error);
    return [];
  }
}
