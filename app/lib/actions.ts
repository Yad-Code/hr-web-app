"use server";

import { auth } from "@/auth";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { ActionState } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// ==========================================
// SCHEMAS & VALIDATION
// ==========================================

//Profile picture:
export async function uploadProfilePicture(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File must be an image" };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { success: false, error: "Image must be smaller than 4MB" };
  }

  try {
    // 2. Fetch user's existing image URL from the database
    const existingUser = await sql`
      SELECT image_url FROM users WHERE email = ${session.user.email}
    `;
    const oldImageUrl = existingUser[0]?.image_url;

    // 3. Upload the new file to Vercel Blob
    const blob = await put(
      `avatars/${session.user.email}-${Date.now()}`,
      file,
      {
        access: "public",
      },
    );

    // 4. Update the database with the new URL
    await sql`
      UPDATE users 
      SET image_url = ${blob.url} 
      WHERE email = ${session.user.email}
    `;

    // 5. Delete the old image file from storage if it exists
    if (oldImageUrl) {
      await del(oldImageUrl);
    }

    revalidatePath("/my-profile");
    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Avatar upload failed:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

// Validation schema for employee-editable profile fields
const ProfileUpdateSchema = z.object({
  preferredName: z
    .string()
    .trim()
    .min(1, { message: "Preferred name is required." }),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    message: "Please select a valid marital status.",
  }),
  bloodGroup: z.enum(
    ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
    {
      message: "Please select a valid blood group.",
    },
  ),
  personalEmail: z
    .string()
    .email({ message: "Invalid personal email address." }),
  personalPhone: z.string().trim().optional(),
  currentAddress: z.string().trim().optional(),
});

// ==========================================
// PROFILE ACTIONS
// ==========================================

/**
 * Server Action to update self-service employee profile fields in PostgreSQL.
 * Ensures strict boundary enforcement—official attributes are omitted entirely.
 */
export async function updateEmployeeProfile(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1. Verify caller session
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  // 2. Extract raw input safely
  const rawData = {
    preferredName: formData.get("preferredName"),
    maritalStatus: formData.get("maritalStatus"),
    bloodGroup: formData.get("bloodGroup"),
    personalEmail: formData.get("personalEmail"),
    personalPhone: formData.get("personalPhone"),
    currentAddress: formData.get("currentAddress"),
  };

  // Safe parse with Zod
  const validatedFields = ProfileUpdateSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const flattenedErrors = validatedFields.error.flatten().fieldErrors;

    console.error("Validation errors:", flattenedErrors);

    return {
      success: false,
      error:
        "Invalid form data. Check your inputs (e.g. Marital Status capitalization).",
      fieldErrors: flattenedErrors,
    };
  }

  const {
    preferredName,
    maritalStatus,
    bloodGroup,
    personalEmail,
    personalPhone,
    currentAddress,
  } = validatedFields.data;

  // 3. Update database
  try {
    await sql`
      UPDATE users  
      SET 
        preferred_name = ${preferredName},
        marital_status = ${maritalStatus},
        blood_group = ${bloodGroup},
        personal_email = ${personalEmail},
        personal_phone = ${personalPhone || null},
        current_address = ${currentAddress || null}
      WHERE email = ${session.user.email}
    `;

    // 4. Trigger Next.js cache revalidation
    revalidatePath("/my-profile");

    return { success: true };
  } catch (error) {
    console.error("Database update failed:", error);

    return {
      success: false,
      error: "Database error occurred while updating profile.",
    };
  }
}
