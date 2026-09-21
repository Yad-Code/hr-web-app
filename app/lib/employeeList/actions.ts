// app/lib/employeeList/actions.ts
"use server";

import { sql } from "../employeeDashboard/employee/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { verifyAccess } from "@/app/lib/auth/access-control";

export type ActionState = {
  success: boolean;
  message: string;
} | null;

export interface UpdateJobInfoState {
  success: boolean;
  message: string;
}

export async function uploadProfilePicture(formData: FormData) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const file = formData.get("avatar") as File;
    const targetUserId = formData.get("employeeId")?.toString() || actorId;

    if (!targetUserId) {
      return { success: false, error: "User identifier is missing." };
    }

    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "update_records";
    const isAuthorized = await verifyAccess(
      actorId,
      requiredAction,
      targetUserId,
    );

    if (!isAuthorized) {
      return {
        success: false,
        error: "Forbidden: You do not have permission to update this avatar.",
      };
    }

    if (!file || file.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error:
          "Security Exception: Only JPG, PNG, WEBP, or GIF files are permitted.",
      };
    }

    if (file.size > 4 * 1024 * 1024) {
      return { success: false, error: "Image must be smaller than 4MB." };
    }

    const existingUser = await sql`
      SELECT image_url, email FROM users WHERE id = ${targetUserId}::uuid
    `;

    if (!existingUser || existingUser.length === 0) {
      return { success: false, error: "User not found." };
    }

    const oldImageUrl = existingUser[0]?.image_url;
    const userIdentifier = existingUser[0]?.email || targetUserId;

    const blob = await put(`avatars/${userIdentifier}-${Date.now()}`, file, {
      access: "public",
    });

    await sql`
      UPDATE users 
      SET image_url = ${blob.url} 
      WHERE id = ${targetUserId}::uuid
    `;

    if (oldImageUrl && oldImageUrl.includes("public.blob.vercel-storage.com")) {
      try {
        await del(oldImageUrl);
      } catch (e) {
        console.warn("Failed to delete old blob:", e);
      }
    }

    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);
    revalidatePath(`/dashboard/employees`);
    revalidatePath(`/my-profile`);

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Avatar upload failed:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function updateEmployeeDetails(
  targetUserId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    const requiredAction =
      actorId === targetUserId ? "edit_personal_profile" : "update_records";
    const isAuthorized = await verifyAccess(
      actorId,
      requiredAction,
      targetUserId,
    );
    if (!isAuthorized) {
      return {
        success: false,
        message:
          "Forbidden: You do not have scoped permission to edit this profile.",
      };
    }

    const canUpdateOfficialRecords = await verifyAccess(
      actorId,
      "update_records",
      targetUserId,
    );
 
    const isJobForm = formData.get("isJobForm") === "true";

    if (isJobForm) {
      if (!canUpdateOfficialRecords) {
        return {
          success: false,
          message:
            "Forbidden: You do not have permission to update official job records.",
        };
      }
 
      const department = formData.get("department")?.toString() || null;
      const branch = formData.get("branch")?.toString() || null;
      const status = formData.get("status")?.toString() || null; 
      const jobTitle = formData.get("jobTitle")?.toString() || null;
      const jobFamily = formData.get("jobFamily")?.toString() || null;
      const employmentType = formData.get("employmentType")?.toString() || null;

      const rawManagerId = formData.get("managerId")?.toString();
      const managerId =
        !rawManagerId || rawManagerId === "none" || rawManagerId.trim() === ""
          ? null
          : rawManagerId;

      if (managerId === targetUserId) {
        return {
          success: false,
          message:
            "Hierarchy Error: An employee cannot be assigned as their own manager.",
        };
      }

      const joinDate = formData.get("joinDate")?.toString() || null;
      const publicOrg = formData.get("publicOrg")?.toString() || null;
      const privateOrg = formData.get("privateOrg")?.toString() || null;
      const insurance = formData.get("insurance")?.toString() || null;
      const subscription = formData.get("subscription")?.toString() || null;

      const rawSalary = formData.get("baseSalary")?.toString();
      const cleanSalary = rawSalary ? rawSalary.replace(/[^0-9.]/g, "") : null;
      const baseSalary = cleanSalary ? Number(cleanSalary) : null; 

      
      await sql`
        UPDATE users 
        SET 
          department = ${department},
          branch = ${branch}, 
          base_salary = ${baseSalary},
          status = ${status},  
          job_title = ${jobTitle}, 
          job_family = ${jobFamily}, 
          employment_type = ${employmentType}, 
          manager_id = ${managerId}::uuid,
          join_date = ${joinDate},
          public_org = ${publicOrg}, 
          private_org = ${privateOrg}, 
          insurance = ${insurance},
          subscription = ${subscription}
        WHERE id = ${targetUserId}::uuid
      `;
    } else {
      // 2. Extract ONLY Personal Profile Fields
      const employeeId = formData.get("employeeId")?.toString() || null;
      const name = formData.get("name")?.toString() || null;
      const email = formData.get("email")?.toString() || null;
      const preferredName = formData.get("preferredName")?.toString() || null;
      const gender = formData.get("gender")?.toString() || null;
      const nationality = formData.get("nationality")?.toString() || null;
      const maritalStatus = formData.get("maritalStatus")?.toString() || null;
      const bloodGroup = formData.get("bloodGroup")?.toString() || null;
      const personalEmail = formData.get("personalEmail")?.toString() || null;
      const personalPhone = formData.get("personalPhone")?.toString() || null;
      const currentAddress = formData.get("currentAddress")?.toString() || null;
      const dateOfBirth = formData.get("dateOfBirth")?.toString() || null;

      if (canUpdateOfficialRecords) {
        if (!name || !email) {
          return {
            success: false,
            message: "Validation Error: Name and Email are required fields.",
          };
        }

        // 👇 FIXED: Dedicated SQL update for Personal Data
        await sql`
          UPDATE users 
          SET 
            employee_id = ${employeeId},
            name = ${name},
            email = ${email},
            preferred_name = ${preferredName}, 
            gender = ${gender},
            nationality = ${nationality},
            marital_status = ${maritalStatus}, 
            blood_group = ${bloodGroup}, 
            personal_email = ${personalEmail}, 
            personal_phone = ${personalPhone}, 
            current_address = ${currentAddress}, 
            date_of_birth = ${dateOfBirth}
          WHERE id = ${targetUserId}::uuid
        `;
      } else {
        await sql`
          UPDATE users 
          SET 
            preferred_name = ${preferredName},
            gender = ${gender},
            nationality = ${nationality},
            marital_status = ${maritalStatus},
            blood_group = ${bloodGroup},
            personal_email = ${personalEmail},
            personal_phone = ${personalPhone},
            current_address = ${currentAddress},
            date_of_birth = ${dateOfBirth}
          WHERE id = ${targetUserId}::uuid
        `;
      }
    }

    revalidatePath(`/dashboard/employees/${targetUserId}`);
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);
    revalidatePath(`/dashboard/employees`);
    revalidatePath(`/dashboard/payroll`);
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

export async function addDocumentAction(
  userId: string,
  newDoc: { title: string; category: string; file_url: string },
) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return { success: false, error: "Unauthorized" };

    const requiredAction =
      actorId === userId ? "edit_personal_profile" : "create_records";
    const isAuthorized = await verifyAccess(actorId, requiredAction, userId);

    if (!isAuthorized) {
      return {
        success: false,
        error: "Forbidden: You do not have scoped permission to add documents.",
      };
    }

    const cleanUrl = newDoc.file_url.split("?")[0];

    try {
      const urlObj = new URL(cleanUrl);
      if (!urlObj.hostname.endsWith(".vercel-storage.com")) {
        return {
          success: false,
          error: "Security Exception: Invalid or untrusted document origin.",
        };
      }
    } catch {
      return { success: false, error: "Invalid URL provided." };
    }

    const fileExtension = cleanUrl.split(".").pop() || "pdf";

    await sql`
      INSERT INTO employee_documents (
        user_id, document_type, file_name, file_extension, file_url
      )
      VALUES (
        ${userId}::uuid, ${newDoc.category}, ${newDoc.title}, ${fileExtension}, ${newDoc.file_url}
      )
    `;

    revalidatePath(`/dashboard/employees/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add document:", error);
    // 👇 FIXED: Return a safe error state
    return {
      success: false,
      error: "Database error occurred while adding document.",
    };
  }
}

export async function deleteDocumentAction(documentId: string, userId: string) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return { success: false, error: "Unauthorized" };

    const requiredAction =
      actorId === userId ? "edit_personal_profile" : "delete_records";
    const isAuthorized = await verifyAccess(actorId, requiredAction, userId);

    if (!isAuthorized) {
      return {
        success: false,
        error:
          "Forbidden: You do not have scoped permission to delete this document.",
      };
    }

    await sql`
      DELETE FROM employee_documents 
      WHERE id = ${documentId}::uuid AND user_id = ${userId}::uuid
    `;

    revalidatePath(`/dashboard/employees/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return {
      success: false,
      error: "Database error occurred while deleting document.",
    };
  }
}

export async function deleteEmployeeAction(targetUserId: string) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) {
      return { success: false, error: "Unauthorized" };
    }

    if (actorId === targetUserId) {
      return {
        success: false,
        error:
          "Security Exception: You cannot delete your own active account. Have another admin perform this action.",
      };
    }

    const isAuthorized = await verifyAccess(
      actorId,
      "delete_records",
      targetUserId,
    );

    if (!isAuthorized) {
      return {
        success: false,
        error:
          "Forbidden: You do not have scoped permission to delete this employee.",
      };
    }

    await sql`DELETE FROM user_permissions WHERE user_id = ${targetUserId}::uuid`;

    await sql`UPDATE users SET manager_id = NULL WHERE manager_id = ${targetUserId}::uuid`;

    revalidatePath(`/dashboard/employees`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete employee.",
    };
  }
}
