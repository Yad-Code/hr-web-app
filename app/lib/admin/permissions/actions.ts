// @/app/lib/admin/permissions/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { verifyAccess } from "@/app/lib/auth/access-control";

export async function getUserPermissions(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 👇 FIXED: Passed targetUserId so a manager can only view permissions of their own scoped team
  const isAuthorized = await verifyAccess(
    session.user.id,
    "manage_system_access",
    targetUserId,
  );

  if (!isAuthorized)
    throw new Error(
      "Forbidden: You lack permission to view this user's access controls.",
    );

  try {
    const permissions = await db`
      SELECT 
        up.id as record_id, 
        p.action, 
        p.description, 
        up.scope, 
        up.target_branch, 
        up.target_department
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ${targetUserId}::uuid
      ORDER BY p.action ASC
    `;
    return permissions;
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
    return [];
  }
}

export async function grantPermission(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = formData.get("userId") as string;

  // 👇 FIXED: Passed userId to ensure the actor is authorized to modify this specific employee
  const isAuthorized = await verifyAccess(
    session.user.id,
    "manage_system_access",
    userId,
  );

  if (!isAuthorized)
    return {
      success: false,
      error: "Forbidden: You lack permission to grant access to this employee.",
    };

  const actionName = formData.get("actionName") as string;
  const scope = formData.get("scope") as string;

  // 👇 FIXED: Strictly nullify branch/department data if the scope doesn't explicitly require it
  const targetBranch =
    scope === "branch"
      ? (formData.get("targetBranch") as string) || null
      : null;
  const targetDepartment =
    scope === "department"
      ? (formData.get("targetDepartment") as string) || null
      : null;

  try {
    const permRecord =
      await db`SELECT id FROM permissions WHERE action = ${actionName} LIMIT 1`;
    if (permRecord.length === 0)
      return { success: false, error: "Invalid permission action." };
    const permissionId = permRecord[0].id;

    await db`
      INSERT INTO user_permissions (user_id, permission_id, scope, target_branch, target_department)
      VALUES (${userId}::uuid, ${permissionId}::uuid, ${scope}::access_scope, ${targetBranch}, ${targetDepartment})
    `;

    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (error) {
    console.error("Failed to grant permission:", error);
    return {
      success: false,
      error: "User may already have this exact permission scope.",
    };
  }
}

export async function revokePermission(recordId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 👇 FIXED: We must fetch the target record FIRST to know WHO we are revoking from
    const targetRecord = await db`
      SELECT up.user_id, p.action 
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.id = ${recordId}::uuid
    `;

    if (targetRecord.length === 0) {
      return { success: false, error: "Permission record not found." };
    }

    const { user_id, action } = targetRecord[0];

    // 👇 FIXED: Now we securely check if the current user has authority over the target user
    const isAuthorized = await verifyAccess(
      currentUserId,
      "manage_system_access",
      String(user_id),
    );

    if (!isAuthorized)
      return {
        success: false,
        error:
          "Forbidden: You lack permission to revoke access from this employee.",
      };

    if (
      String(user_id) === currentUserId &&
      (action === "manage_system" || action === "manage_system_access")
    ) {
      return {
        success: false,
        error:
          "Action Denied: For security reasons, you cannot revoke your own admin privileges.",
      };
    }

    await db`DELETE FROM user_permissions WHERE id = ${recordId}::uuid`;
    revalidatePath("/dashboard/employees");

    return { success: true };
  } catch (error) {
    console.error("Failed to revoke permission:", error);
    return { success: false, error: "Database error." };
  }
}
