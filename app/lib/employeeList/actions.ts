// app/lib/employeeList/actions.ts
"use server";

import { sql } from "../employeeDashboard/employee/db";
import { auth } from "@/auth";
import { getCurrentUserRole } from "@/app/lib/employeeDashboard/employee/data";
import { revalidatePath } from "next/cache";

// Define the response state type for React's useActionState hook
export type ActionState = {
  success: boolean;
  message: string;
} | null;

export async function updateEmployeeProfile(
  targetUserId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Authenticate session
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    const currentRole = await getCurrentUserRole();
    const isAdmin = currentRole === "admin";
    const isEditingSelf = session.user.id === targetUserId;

    // 2. Protect against non-admins editing other people's profiles
    if (!isEditingSelf && !isAdmin) {
      return {
        success: false,
        message: "Forbidden: Only admins can edit other profiles.",
      };
    }

    // 3. Extract form values safely
    const name = formData.get("name")?.toString() || null;
    const email = formData.get("email")?.toString() || null;
    const department = formData.get("department")?.toString() || null;
    const status = formData.get("status")?.toString() || "active";

    // 4. Update Database
    if (isAdmin) {
      // Admins can update name, email, department, status AND role
      const role = formData.get("role")?.toString() || "employee";
      await sql`
        UPDATE users 
        SET 
          name = ${name},
          email = ${email},
          department = ${department},
          status = ${status},
          role = ${role}
        WHERE id = ${targetUserId}::uuid
      `;
    } else {
      // Non-admins editing themselves CANNOT touch the role column
      await sql`
        UPDATE users 
        SET 
          name = ${name},
          email = ${email},
          department = ${department},
          status = ${status}
        WHERE id = ${targetUserId}::uuid
      `;
    }

    // 5. Revalidate Cache for active Next.js routes
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);
    revalidatePath(`/dashboard/employees`);
    revalidatePath(`/my-profile`);

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Database update error:", error);
    return {
      success: false,
      message: "Failed to update profile in database. Please try again.",
    };
  }
}