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
    const name = formData.get("name")?.toString() || null;
    const email = formData.get("email")?.toString() || null;
    const department = formData.get("department")?.toString() || null;
    const status = formData.get("status")?.toString() || "active";

    // 2. Extract Personal Information Details (Safeguarded against undefined)
    const preferredName = formData.get("preferredName")?.toString() || null;
    const maritalStatus = formData.get("maritalStatus")?.toString() || "Single";
    const bloodGroup = formData.get("bloodGroup")?.toString() || "Unknown";
    const personalEmail = formData.get("personalEmail")?.toString() || null;
    const personalPhone = formData.get("personalPhone")?.toString() || null;
    const currentAddress = formData.get("currentAddress")?.toString() || null;

    // 3. Update Database (Dynamic Role handling)
    if (isAdmin) {
      const role = formData.get("role")?.toString() || "employee";
      await sql`
        UPDATE users 
        SET 
          name = ${name},
          email = ${email},
          department = ${department},
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
      // Non-admins cannot update role
      await sql`
        UPDATE users 
        SET 
          name = ${name},
          email = ${email},
          department = ${department},
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
