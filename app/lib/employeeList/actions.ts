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

export async function updateEmployeeProfile(
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
        message: "Forbidden: Only admins can edit other profiles.",
      };
    }

    // 1. Extract Official Account Details (Safeguarded against undefined)
    const employeeId = formData.get("employeeId")?.toString() || null;
    const name = formData.get("name")?.toString() || null;
    const email = formData.get("email")?.toString() || null;
    const department = formData.get("department")?.toString() || null;
    const branch = formData.get("branch")?.toString() || null;
    const dateOfBirth = formData.get("dateOfBirth")?.toString() || null;
    const gender = formData.get("gender")?.toString() || null;
    const nationality = formData.get("nationality")?.toString() || null;
    const status = formData.get("status")?.toString() || "active";

    // Extract Base Salary (Defaulting to 3500 if missing or invalid)
    const rawSalary = formData.get("baseSalary");
    const baseSalary = rawSalary ? Number(rawSalary) : 3500.0;

    // 2. Extract Personal Information Details
    const preferredName = formData.get("preferredName")?.toString() || null;
    const maritalStatus = formData.get("maritalStatus")?.toString() || "Single";
    const bloodGroup = formData.get("bloodGroup")?.toString() || "Unknown";
    const personalEmail = formData.get("personalEmail")?.toString() || null;
    const personalPhone = formData.get("personalPhone")?.toString() || null;
    const currentAddress = formData.get("currentAddress")?.toString() || null;

    // 3. Update Database (Dynamic Role handling - UUID is untouched)
    if (isAdmin) {
      const role = formData.get("role")?.toString() || "employee";
      await sql`
        UPDATE users 
        SET 
          employee_id = ${employeeId},
          name = ${name},
          email = ${email},
          department = ${department},
          branch = ${branch},
          base_salary = ${baseSalary}, - Updated by Admin
          date_of_birth = ${dateOfBirth},
          gender = ${gender},
          nationality = ${nationality},
          status = ${status},
          role = ${role},
          preferred_name = ${preferredName},
          marital_status = ${maritalStatus},
          blood_group = ${bloodGroup},
          personal_email = ${personalEmail},
          personal_phone = ${personalPhone},
          current_address = ${currentAddress}
        WHERE id = ${targetUserId}::uuid
      `;
    } else {
      // Regular employees editing their own profile will NOT overwrite base_salary
      await sql`
        UPDATE users 
        SET 
          employee_id = ${employeeId},
          name = ${name},
          email = ${email},
          department = ${department},
          branch = ${branch},
          date_of_birth = ${dateOfBirth},
          gender = ${gender},
          nationality = ${nationality},
          status = ${status},
          preferred_name = ${preferredName},
          marital_status = ${maritalStatus},
          blood_group = ${bloodGroup},
          personal_email = ${personalEmail},
          personal_phone = ${personalPhone},
          current_address = ${currentAddress}
        WHERE id = ${targetUserId}::uuid
      `;
    }

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

export async function updateAdminJobInformation(
  targetUserId: string,
  formData: Record<string, string>,
): Promise<UpdateJobInfoState> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    const currentRole = await getCurrentUserRole();
    if (currentRole !== "admin") {
      return {
        success: false,
        message: "Forbidden: Only admins can update job details.",
      };
    }

    // Parse base salary safely
    const baseSalary = formData.base_salary ? Number(formData.base_salary) : null;

    // Execute SQL Update
    await sql`
     UPDATE users 
      SET 
        job_title = ${formData.jobTitle || null}, 
        job_family = ${formData.jobFamily || null},
        employment_type = ${formData.employmentType || null},
        department = ${formData.department || null},
        branch = ${formData.branch || null},
        manager_name = ${formData.managerName || null},
        join_date = ${formData.joinDate || null},
        base_salary = ${baseSalary},
        status = ${formData.status || null},
        public_org = ${formData.publicOrg || null},
        private_org = ${formData.privateOrg || null},
        insurance = ${formData.insurance || null},
        subscription = ${formData.subscription || null}
      WHERE id = ${targetUserId}::uuid
    `;

    // Revalidate relevant cached pages
    revalidatePath(`/dashboard/employees/${targetUserId}`);
    revalidatePath(`/dashboard/employees/${targetUserId}/edit`);
    revalidatePath(`/dashboard/payroll`);

    return {
      success: true,
      message: "Job details updated successfully!",
    };
  } catch (error) {
    console.error("Database update error:", error);
    return {
      success: false,
      message: "Failed to update job details in database.",
    };
  }
}

