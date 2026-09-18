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

    // 👇 2. Dynamic ABAC Security Check
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

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Selected file must be an image." };
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

    // 👇 3. Dynamic ABAC Check for viewing/saving the edit form
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

    const department = formData.get("department")?.toString() || null;
    const branch = formData.get("branch")?.toString() || null;
    const status = formData.get("status")?.toString() || null;
    const role = formData.get("role")?.toString() || null;

    const jobTitle = formData.get("jobTitle")?.toString() || null;
    const jobFamily = formData.get("jobFamily")?.toString() || null;
    const employmentType = formData.get("employmentType")?.toString() || null;
    const managerId = formData.get("managerId")?.toString() || null;
    const joinDate = formData.get("joinDate")?.toString() || null;
    const publicOrg = formData.get("publicOrg")?.toString() || null;
    const privateOrg = formData.get("privateOrg")?.toString() || null;
    const insurance = formData.get("insurance")?.toString() || null;
    const subscription = formData.get("subscription")?.toString() || null;

    const rawSalary = formData.get("baseSalary");
    const baseSalary = rawSalary ? Number(rawSalary) : null;

    // 👇 4. Determine if they have Administrative Data powers, or just Personal Edit powers
    const canUpdateOfficialRecords = await verifyAccess(
      actorId,
      "update_records",
      targetUserId,
    );

    if (canUpdateOfficialRecords) {
      await sql`
        UPDATE users 
        SET 
          employee_id = COALESCE(${employeeId}, employee_id),
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          department = COALESCE(${department}, department),
          branch = COALESCE(${branch}, branch),
          base_salary = COALESCE(${baseSalary}, base_salary),
          date_of_birth = COALESCE(${dateOfBirth}, date_of_birth),
          gender = COALESCE(${gender}, gender),
          nationality = COALESCE(${nationality}, nationality),
          status = COALESCE(${status}, status),
          role = COALESCE(${role}, role),
          preferred_name = COALESCE(${preferredName}, preferred_name),
          marital_status = COALESCE(${maritalStatus}, marital_status),
          blood_group = COALESCE(${bloodGroup}, blood_group),
          personal_email = COALESCE(${personalEmail}, personal_email),
          personal_phone = COALESCE(${personalPhone}, personal_phone),
          current_address = COALESCE(${currentAddress}, current_address),
          job_title = COALESCE(${jobTitle}, job_title),
          job_family = COALESCE(${jobFamily}, job_family),
          employment_type = COALESCE(${employmentType}, employment_type),
          manager_id = COALESCE(${managerId}::uuid, manager_id),
          join_date = COALESCE(${joinDate}, join_date),
          public_org = COALESCE(${publicOrg}, public_org),
          private_org = COALESCE(${privateOrg}, private_org),
          insurance = COALESCE(${insurance}, insurance),
          subscription = COALESCE(${subscription}, subscription)
        WHERE id = ${targetUserId}::uuid
      `;
    } else {
      // Standard employee editing their own profile
      await sql`
        UPDATE users 
        SET 
          employee_id = COALESCE(${employeeId}, employee_id),
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          department = COALESCE(${department}, department),
          branch = COALESCE(${branch}, branch),
          date_of_birth = COALESCE(${dateOfBirth}, date_of_birth),
          gender = COALESCE(${gender}, gender),
          nationality = COALESCE(${nationality}, nationality),
          status = COALESCE(${status}, status),
          preferred_name = COALESCE(${preferredName}, preferred_name),
          marital_status = COALESCE(${maritalStatus}, marital_status),
          blood_group = COALESCE(${bloodGroup}, blood_group),
          personal_email = COALESCE(${personalEmail}, personal_email),
          personal_phone = COALESCE(${personalPhone}, personal_phone),
          current_address = COALESCE(${currentAddress}, current_address)
        WHERE id = ${targetUserId}::uuid
      `;
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
    if (!actorId) throw new Error("Unauthorized");

    // 👇 5. Dynamic ABAC Check for Documents
    const requiredAction =
      actorId === userId ? "edit_personal_profile" : "create_records";
    const isAuthorized = await verifyAccess(actorId, requiredAction, userId);

    if (!isAuthorized) {
      throw new Error(
        "Forbidden: You do not have scoped permission to add documents.",
      );
    }

    const cleanUrl = newDoc.file_url.split("?")[0];
    const fileExtension = cleanUrl.split(".").pop() || "pdf";

    await sql`
      INSERT INTO employee_documents (
        user_id, 
        document_type, 
        file_name, 
        file_extension, 
        file_url
      )
      VALUES (
        ${userId}::uuid, 
        ${newDoc.category}, 
        ${newDoc.title}, 
        ${fileExtension}, 
        ${newDoc.file_url}
      )
    `;

    revalidatePath(`/dashboard/employees/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add document:", error);
    throw error;
  }
}

export async function deleteDocumentAction(documentId: string, userId: string) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) throw new Error("Unauthorized");

    // 👇 6. Dynamic ABAC Check for Deleting Documents
    const requiredAction =
      actorId === userId ? "edit_personal_profile" : "delete_records";
    const isAuthorized = await verifyAccess(actorId, requiredAction, userId);

    if (!isAuthorized) {
      throw new Error(
        "Forbidden: You do not have scoped permission to delete this document.",
      );
    }

    await sql`
      DELETE FROM employee_documents WHERE id = ${documentId}::uuid
    `;

    revalidatePath(`/dashboard/employees/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    throw error;
  }
}

export async function deleteEmployeeAction(targetUserId: string) {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) {
      return { success: false, error: "Unauthorized" };
    }

    // Dynamic Security Check: Can this user delete records for this specific target?
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

    // Delete the user (Cascading deletes in DB will handle their related records)
    await sql`DELETE FROM users WHERE id = ${targetUserId}::uuid`;

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
