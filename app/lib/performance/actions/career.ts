// app/lib/performance/actions/career.ts
"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";
import {
  RequestMeetingData,
  UpdateCareerData,
} from "@/app/lib/performance/definitions";

export async function requestOneOnOne(data: RequestMeetingData) {
  try {
    const userId = await getCurrentUserId();

    await sql`
      INSERT INTO one_on_one_meetings (
        employee_id,   -- 👈 Fixed: Matches your seeded table schema
        manager_id,    -- 👈 Added: Required because it is NOT NULL
        topic,
        meeting_date,
        notes,
        status,
        created_at
      )
      VALUES (
        ${userId},
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1), -- Automatically assigns your seeded Admin Manager
        ${data.topic},
        ${data.meeting_date},
        ${data.notes || null},
        'Scheduled',
        NOW()
      )
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to request 1:1 meeting:", error);
    throw new Error("Failed to request meeting.");
  }
}

export async function updateCareerPlan(data: UpdateCareerData) {
  try {
    const userId = await getCurrentUserId();

    await sql`
      INSERT INTO career_development (
        user_id,
        current_position,
        target_position,
        target_date,
        roadmap,
        updated_at
      )
      VALUES (
        ${userId},
        ${data.current_position},
        ${data.target_position},
        ${data.target_date},
        ${data.roadmap || null},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        current_position = EXCLUDED.current_position,
        target_position = EXCLUDED.target_position,
        target_date = EXCLUDED.target_date,
        roadmap = EXCLUDED.roadmap,
        updated_at = NOW()
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update career plan:", error);
    throw new Error("Failed to update career plan.");
  }
}
