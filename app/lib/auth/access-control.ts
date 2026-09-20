import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { cache } from "react";

/**
 * Universal Access Control Gateway
 * Verifies if an actor has the permission and scope to perform an action on a target user.
 */

export async function verifyAccess(
  actorId: string,
  actionName: string,
  targetUserId: string,
): Promise<boolean> {
  if (!actorId || !actionName || !targetUserId) return false;

  try {
    const perms = await db`
      SELECT up.scope, up.target_branch, up.target_department
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${actorId}::uuid AND p.action = ${actionName}
    `;

    if (perms.length === 0) return false;
    if (perms.some((p) => p.scope === "global")) return true;
    
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
      if (perm.scope === "self" && actorId === targetUserId) {
        return true;
      }
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

const getCachedUserFeatures = cache(async (actorId: string) => {
  try {
    const result = await db`
      SELECT p.action 
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = ${actorId}::uuid
    `;
    // Store as a Set for instant O(1) lookups
    return new Set(result.map((row) => row.action));
  } catch (error) {
    console.error("Failed to fetch user features:", error);
    return new Set();
  }
});

export async function verifyFeatureAccess(actorId: string, action: string) {
  if (!actorId || !action) {
    return false;
  }

  try {
    const userFeatures = await getCachedUserFeatures(actorId);
    return userFeatures.has(action);
  } catch (error) {
    console.error("Feature access check failed:", error);
    return false;
  }
}
