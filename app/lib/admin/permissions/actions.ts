"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getUserPermissions(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Unauthorized");

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
      WHERE up.user_id = ${targetUserId}
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
  if (!session?.user?.isAdmin) return { success: false, error: "Unauthorized" };

  const userId = formData.get("userId") as string;
  const actionName = formData.get("actionName") as string;
  const scope = formData.get("scope") as string;
  const targetBranch = formData.get("targetBranch") as string | null;
  const targetDepartment = formData.get("targetDepartment") as string | null;

  try {
    const permRecord =
      await db`SELECT id FROM permissions WHERE action = ${actionName} LIMIT 1`;
    if (permRecord.length === 0)
      return { success: false, error: "Invalid permission action." };
    const permissionId = permRecord[0].id;

    await db`
      INSERT INTO user_permissions (user_id, permission_id, scope, target_branch, target_department)
      VALUES (${userId}, ${permissionId}, ${scope}, ${targetBranch || null}, ${targetDepartment || null})
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

  if (!session?.user?.isAdmin || !currentUserId) {
    return { success: false, error: "Unauthorized" };
  }

  try { 
    const targetRecord = await db`
      SELECT up.user_id, p.action 
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.id = ${recordId}
    `;

    if (targetRecord.length === 0) {
      return { success: false, error: "Permission record not found." };
    }

    const { user_id, action } = targetRecord[0];
 
    if (user_id === currentUserId && action === "manage_system") {
      return {
        success: false,
        error:
          "Action Denied: For security reasons, you cannot revoke your own global admin privileges.",
      };
    }
 
    await db`DELETE FROM user_permissions WHERE id = ${recordId}`;
    revalidatePath("/dashboard/employees");

    return { success: true };
  } catch (error) {
    console.error("Failed to revoke permission:", error);
    return { success: false, error: "Database error." };
  }
}
