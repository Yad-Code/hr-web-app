// app/lib/employeeList/actions.ts
"use server";

import { sql } from "../employeeDashboard/employee/db";
import { auth } from "@/auth";
import { getCurrentUserRole } from "@/app/lib/employeeDashboard/employee/data";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

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
    if (!session?.user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const file = formData.get("avatar") as File;
    const targetUserId =
      formData.get("employeeId")?.toString() || session.user?.id;

    // Guard clause: ensures targetUserId is a defined string
    if (!targetUserId) {
      return { success: false, error: "User identifier is missing." };
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

    // Fetch existing user to retrieve old image URL and identifier for file naming
    const existingUser = await sql`
      SELECT image_url, email FROM users WHERE id = ${targetUserId}::uuid
    `;

    if (!existingUser || existingUser.length === 0) {
      return { success: false, error: "User not found." };
    }

    const oldImageUrl = existingUser[0]?.image_url;
    const userIdentifier = existingUser[0]?.email || targetUserId;

    // 1. Upload new image to Vercel Blob
    const blob = await put(`avatars/${userIdentifier}-${Date.now()}`, file, {
      access: "public",
    });

    // 2. Update Postgres database with the Vercel Blob URL
    await sql`
      UPDATE users 
      SET image_url = ${blob.url} 
      WHERE id = ${targetUserId}::uuid
    `;

    // 3. Clean up old blob image safely if it exists on Vercel Blob
    if (oldImageUrl && oldImageUrl.includes("public.blob.vercel-storage.com")) {
      try {
        await del(oldImageUrl);
      } catch (e) {
        console.warn("Failed to delete old blob:", e);
      }
    }

    // 4. Revalidate cache for all profile & admin edit views
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
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    const currentRole = await getCurrentUserRole();
    const isAdmin = currentRole === "admin";
    const isEditingSelf = session.user.id === targetUserId;

    if (!isEditingSelf && !isAdmin) {
      return {
        success: false,
        message: "Forbidden: You do not have permission to edit this profile.",
      };
    }

    // Extract all potential fields from formData
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
    const managerName = formData.get("managerName")?.toString() || null;
    const joinDate = formData.get("joinDate")?.toString() || null;
    const publicOrg = formData.get("publicOrg")?.toString() || null;
    const privateOrg = formData.get("privateOrg")?.toString() || null;
    const insurance = formData.get("insurance")?.toString() || null;
    const subscription = formData.get("subscription")?.toString() || null;

    const rawSalary = formData.get("baseSalary");
    const baseSalary = rawSalary ? Number(rawSalary) : null;

    // Use COALESCE so fields omitted from the active form retain their existing DB values
    if (isAdmin) {
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
          role = COALESCE(${role}::user_role, role),
          preferred_name = COALESCE(${preferredName}, preferred_name),
          marital_status = COALESCE(${maritalStatus}, marital_status),
          blood_group = COALESCE(${bloodGroup}, blood_group),
          personal_email = COALESCE(${personalEmail}, personal_email),
          personal_phone = COALESCE(${personalPhone}, personal_phone),
          current_address = COALESCE(${currentAddress}, current_address),
          job_title = COALESCE(${jobTitle}, job_title),
          job_family = COALESCE(${jobFamily}, job_family),
          employment_type = COALESCE(${employmentType}, employment_type),
          manager_name = COALESCE(${managerName}, manager_name),
          join_date = COALESCE(${joinDate}, join_date),
          public_org = COALESCE(${publicOrg}, public_org),
          private_org = COALESCE(${privateOrg}, private_org),
          insurance = COALESCE(${insurance}, insurance),
          subscription = COALESCE(${subscription}, subscription)
        WHERE id = ${targetUserId}::uuid
      `;
    } else {
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
