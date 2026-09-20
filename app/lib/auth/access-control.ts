import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

/**
 * Universal Access Control Gateway
 * Verifies if an actor has the permission and scope to perform an action on a target user.
 */

export async function verifyAccess(
  actorId: string,
  actionName: string,
  targetUserId?: string,
): Promise<boolean> {
  try {
    const perms = await db`
      SELECT up.scope, up.target_branch, up.target_department
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${actorId}::uuid AND p.action = ${actionName}
    `;

    if (perms.length === 0) return false;
    if (perms.some((p) => p.scope === "global")) return true;
    if (!targetUserId) return true;
    if (actorId === targetUserId) return true;

    const targetQuery = await db`
      SELECT branch, department, manager_id FROM users WHERE id = ${targetUserId}::uuid
    `;
    if (targetQuery.length === 0) return false;
    const targetUser = targetQuery[0];

    const actorQuery = await db`
      SELECT branch, department FROM users WHERE id = ${actorId}::uuid
    `;
    const actor = actorQuery[0];

    for (const perm of perms) {
      if (perm.scope === "team" && targetUser.manager_id === actorId) {
        return true;
      }
      if (perm.scope === "branch") {
        const authorizedBranch = perm.target_branch || actor.branch;
        if (targetUser.branch === authorizedBranch) return true;
      }
      if (perm.scope === "department") {
        const authorizedDept = perm.target_department || actor.department;
        if (targetUser.department === authorizedDept) return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Access Control Error:", error);
    return false;
  }
}

export async function verifyFeatureAccess(actorId: string, action: string) {
  try {
    const result = await db`
      SELECT 1 FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = ${actorId}::uuid AND p.action = ${action}
      LIMIT 1
    `;
    return result.length > 0;
  } catch (error) {
    console.error("Feature access check failed:", error);
    return false;
  }
}
