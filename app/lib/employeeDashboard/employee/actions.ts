"use server";

import { auth } from "@/auth";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ActionState } from "./definitions";
import {
  getTodayAttendance,
  createCheckIn,
  updateCheckOut,
  getFormattedTime,
  calculateWorkHours,
} from "@/app/lib/employeeDashboard/employee/data";
import { sql } from "@/app/lib/employeeDashboard/employee/db";

// ==========================================
// SCHEMAS & VALIDATION
// ==========================================

// Profile picture:
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
    const existingUser = await sql`
      SELECT image_url FROM users WHERE email = ${session.user.email}
    `;
    const oldImageUrl = existingUser[0]?.image_url;

    // 1. Upload new image to Vercel Blob
    const blob = await put(
      `avatars/${session.user.email}-${Date.now()}`,
      file,
      { access: "public" },
    );

    // 2. Update Postgres database
    await sql`
      UPDATE users 
      SET image_url = ${blob.url} 
      WHERE email = ${session.user.email}
    `;

    // 3. Clean up old blob image safely
    if (oldImageUrl && oldImageUrl.includes("public.blob.vercel-storage.com")) {
      try {
        await del(oldImageUrl);
      } catch (e) {
        console.warn("Failed to delete old blob:", e);
      }
    }

    // 4. Revalidate cache for all profile & team views
    revalidatePath("/my-profile");
    revalidatePath("/employees");

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
// ==========================================
// ATTENDANCE & CHECK-IN ACTIONS
// ==========================================

function getLocalDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function toggleCheckInStatus(
  location: "Office" | "Remote" = "Office",
) {
  try {
    const session = await auth();

    // 1. Verify email exists on session
    if (!session?.user?.email) {
      console.error("Auth Failed: User session email missing.", session);
      return {
        success: false,
        error: "Unauthorized: Missing user session email.",
      };
    }

    // 2. Resolve actual Postgres UUID using verified email
    const userQuery = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!userQuery || userQuery.length === 0) {
      return { success: false, error: "User not found in the database." };
    }

    const userId = userQuery[0].id;
    const today = getLocalDateString();
    const nowTime = getFormattedTime();

    const existingRecord = await getTodayAttendance(userId, today);

    if (!existingRecord) {
      // Action: Check In
      await createCheckIn(userId, today, nowTime, location);
    } else if (!existingRecord.check_out) {
      // Action: Check Out
      const checkInTime = existingRecord.check_in || nowTime;
      const workHours = calculateWorkHours(checkInTime, nowTime);
      await updateCheckOut(existingRecord.id, nowTime, workHours);
    } else {
      return { success: false, error: "Shift already completed for today." };
    }

    revalidatePath("/my-profile/attendance");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in toggleCheckInStatus:", error);
    return { success: false, error: `Server error: ${message}` };
  }
}

// ==========================================
// WFH REQUEST ACTION
// ==========================================
export async function submitWFHRequest(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const type = (formData.get("type") as string) || "wfh";
  const reason = formData.get("reason") as string;

  if (!reason) {
    return { success: false, error: "Reason is required." };
  }

  try {
    // 1. Resolve Postgres UUID for current user
    const userQuery = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!userQuery || userQuery.length === 0) {
      return { success: false, error: "User not found in database." };
    }

    const userId = userQuery[0].id;

    // 2. Fetch balance for backend validation
    const [balance] = await sql`
      SELECT annual_remaining, sick_remaining, monthly_remaining_hours
      FROM leave_balances
      WHERE user_id = ${userId}
    `;

    let startDate: string | null = null;
    let endDate: string | null = null;
    let leaveCategory: string | null = null;
    let totalDays: number = 0;
    let hours: number = 0;
    let originalDate: string | null = null;
    let exchangeDate: string | null = null;

    // 3. Extract request parameters based on type
    if (type === "wfh") {
      startDate = formData.get("date") as string;
      endDate = startDate;
      totalDays = 1;
      if (!startDate)
        return { success: false, error: "Date is required for WFH." };
    } else if (type === "dayoff") {
      startDate = formData.get("startDate") as string;
      endDate = formData.get("endDate") as string;
      leaveCategory = (formData.get("leaveCategory") as string) || "annual";
      totalDays = Number(formData.get("totalDays")) || 1;

      if (!startDate || !endDate) {
        return { success: false, error: "Start and end dates are required." };
      }

      // Balance guardrails
      if (balance) {
        if (
          leaveCategory === "annual" &&
          totalDays > balance.annual_remaining
        ) {
          return {
            success: false,
            error: `Insufficient Annual Leave (${balance.annual_remaining} days remaining).`,
          };
        }
        if (leaveCategory === "sick" && totalDays > balance.sick_remaining) {
          return {
            success: false,
            error: `Insufficient Sick Leave (${balance.sick_remaining} days remaining).`,
          };
        }
      }
    } else if (type === "timeoff") {
      startDate = formData.get("date") as string;
      endDate = startDate;
      hours = Number(formData.get("hours")) || 0;

      if (!startDate || hours <= 0) {
        return { success: false, error: "Date and valid hours are required." };
      }

      if (balance && hours > balance.monthly_remaining_hours) {
        return {
          success: false,
          error: `Insufficient monthly hours (${balance.monthly_remaining_hours} hrs remaining).`,
        };
      }
    } else if (type === "exchange") {
      originalDate = formData.get("originalDate") as string;
      exchangeDate = formData.get("exchangeDate") as string;

      if (!originalDate || !exchangeDate) {
        return {
          success: false,
          error: "Original date and exchange date are required.",
        };
      }
    }

    // 4. Insert into updated leave_requests table
    await sql`
      INSERT INTO leave_requests (
        user_id,
        type,
        leave_category,
        start_date,
        end_date,
        total_days,
        hours,
        original_date,
        exchange_date,
        reason,
        status
      )
      VALUES (
        ${userId},
        ${type},
        ${leaveCategory},
        ${startDate},
        ${endDate},
        ${totalDays},
        ${hours},
        ${originalDate},
        ${exchangeDate},
        ${reason},
        'Pending'
      )
    `;

    // 5. Revalidate cache for real-time UI updates
    revalidatePath("/my-profile/attendance");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Leave request error:", error);
    return { success: false, error: "Could not submit leave request." };
  }
}
