"use server";

import { auth } from "@/auth";
import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { ActionState } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// ==========================================
// SCHEMAS & VALIDATION
// ==========================================

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
    }
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