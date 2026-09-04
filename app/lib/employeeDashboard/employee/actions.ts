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

    // 2. Fetch user ID and their base working days
    const userQuery = await sql`
      SELECT id, working_days FROM users WHERE email = ${session.user.email}
    `;

    if (!userQuery || userQuery.length === 0) {
      return { success: false, error: "User not found in the database." };
    }

    const userId = userQuery[0].id;
    const workingDays = userQuery[0].working_days || [1, 2, 3, 4, 5];
    const today = getLocalDateString();
    const nowTime = getFormattedTime();

    // 3. Safely calculate the day of the week to prevent timezone shifting
    const [y, m, d] = today.split("-");
    const dayOfWeek = new Date(Number(y), Number(m) - 1, Number(d)).getDay();

    let isWorkingDay = workingDays.includes(dayOfWeek);

    // 4. Check for any approved shift swaps for today
    const overrideQuery = await sql`
      SELECT is_working FROM schedule_overrides 
      WHERE user_id = ${userId} AND target_date = ${today}
    `;

    if (overrideQuery && overrideQuery.length > 0) {
      isWorkingDay = overrideQuery[0].is_working;
    }

    // 5. Block check-in if it's an off day
    if (!isWorkingDay) {
      return {
        success: false,
        error: "You are not scheduled to work today. Enjoy your day off!",
      };
    }

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

export async function submitWFHRequest(formData: FormData) {
  const session = await auth();
  const helperId = formData.get("helperId") as string | null;

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const type = (formData.get("type") as string) || "wfh";
  const reason = formData.get("reason") as string;

  if (!reason) {
    return { success: false, error: "Reason is required." };
  }

  try {
    const userQuery = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!userQuery || userQuery.length === 0) {
      return { success: false, error: "User not found in database." };
    }

    const userId = userQuery[0].id;

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

    const helperStatus = type === "exchange" ? "Pending" : "N/A";

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
        helper_id,
        helper_status,
        reason,
        status
      )
      VALUES (
        ${userId},
        ${type},
        ${leaveCategory || null},
        ${startDate || null},
        ${endDate || null},
        ${totalDays},
        ${hours},
        ${originalDate || null},
        ${exchangeDate || null},
        ${helperId || null},
        ${helperStatus},
        ${reason},
        'Pending'
      )
    `;

    if (type === "exchange" && helperId) {
      await sql`
        INSERT INTO performance_notifications (user_id, requester_id, title, description, type)
        VALUES (${helperId}, ${userId}, 'Shift Exchange Request', 'Someone wants to trade shifts with you.', 'Exchange')
      `;
    }

    revalidatePath("/my-profile/attendance");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Leave request error:", error);
    return { success: false, error: "Could not submit leave request." };
  }
}

export async function approveLeaveRequest(requestId: string) {
  try {
    // UPDATED: Fetch the new exchange fields needed for overrides
    const requests = await sql`
      SELECT id, user_id, type, leave_category, total_days, hours, status, 
             helper_id, original_date, exchange_date
      FROM leave_requests 
      WHERE id = ${requestId}
    `;

    if (!requests || requests.length === 0) {
      return { success: false, error: "Request not found." };
    }

    const request = requests[0];

    if (request.status !== "Pending") {
      return {
        success: false,
        error: `Request has already been ${request.status.toLowerCase()}.`,
      };
    }

    const { user_id, type, leave_category, total_days, hours } = request;

    // --- LEAVE BALANCE LOGIC ---
    if (type === "dayoff") {
      if (leave_category === "annual") {
        const [balance] =
          await sql`SELECT annual_remaining FROM leave_balances WHERE user_id = ${user_id}`;
        if (balance && balance.annual_remaining < total_days) {
          return {
            success: false,
            error: `Insufficient Annual Leave balance (${balance.annual_remaining} left).`,
          };
        }
        await sql`UPDATE leave_balances SET annual_remaining = annual_remaining - ${total_days} WHERE user_id = ${user_id}`;
      } else if (leave_category === "sick") {
        const [balance] =
          await sql`SELECT sick_remaining FROM leave_balances WHERE user_id = ${user_id}`;
        if (balance && balance.sick_remaining < total_days) {
          return {
            success: false,
            error: `Insufficient Sick Leave balance (${balance.sick_remaining} left).`,
          };
        }
        await sql`UPDATE leave_balances SET sick_remaining = sick_remaining - ${total_days} WHERE user_id = ${user_id}`;
      }
    } else if (type === "timeoff") {
      const [balance] =
        await sql`SELECT monthly_remaining_hours FROM leave_balances WHERE user_id = ${user_id}`;
      if (balance && balance.monthly_remaining_hours < hours) {
        return {
          success: false,
          error: `Insufficient monthly hours remaining (${balance.monthly_remaining_hours} hrs left).`,
        };
      }
      await sql`UPDATE leave_balances SET monthly_remaining_hours = monthly_remaining_hours - ${hours} WHERE user_id = ${user_id}`;
    }

    // --- NEW: SCHEDULE OVERRIDE LOGIC ---
    if (type === "exchange" && request.helper_id) {
      // 1. Requester Overrides
      await sql`
        INSERT INTO schedule_overrides (user_id, target_date, is_working, notes)
        VALUES 
          (${user_id}, ${request.original_date}, false, 'Shift given to helper'),
          (${user_id}, ${request.exchange_date}, true, 'Shift taken from helper')
        ON CONFLICT (user_id, target_date) DO UPDATE SET is_working = EXCLUDED.is_working
      `;

      // 2. Helper Overrides
      await sql`
        INSERT INTO schedule_overrides (user_id, target_date, is_working, notes)
        VALUES 
          (${request.helper_id}, ${request.original_date}, true, 'Covering requester shift'),
          (${request.helper_id}, ${request.exchange_date}, false, 'Shift given to requester')
        ON CONFLICT (user_id, target_date) DO UPDATE SET is_working = EXCLUDED.is_working
      `;
    }

    // --- FINALIZE STATUS ---
    await sql`
      UPDATE leave_requests 
      SET status = 'Approved', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `;

    revalidatePath("/dashboard");
    revalidatePath("/my-profile/attendance"); // Ensure calendars refresh immediately

    return { success: true };
  } catch (error) {
    console.error("Error approving leave request:", error);
    return { success: false, error: "Failed to approve request." };
  }
}

export async function respondToExchangeRequest(
  requestId: string,
  status: "Accepted" | "Rejected",
) {
  try {
    if (status === "Rejected") {
      await sql`
        UPDATE leave_requests 
        SET helper_status = 'Rejected', status = 'Rejected' 
        WHERE id = ${requestId}
      `;
    } else {
      // 1. Update the coworker's acceptance
      await sql`
        UPDATE leave_requests 
        SET helper_status = 'Accepted' 
        WHERE id = ${requestId}
      `;

      // 2. AUTO-APPROVE IT so the schedule overrides are created instantly!
      await approveLeaveRequest(requestId);
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to respond to exchange:", error);
    return { success: false, error: "Failed to update request." };
  }
}

export async function rejectLeaveRequest(requestId: string) {
  try {
    await sql`
      UPDATE leave_requests 
      SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
    `;

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    return { success: false, error: "Failed to decline request." };
  }
}
