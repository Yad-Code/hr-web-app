// @/app/lib/performance/actions/selfAssessment.ts
"use server";

import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { SelfAssessmentSchema } from "../validations";
import { getCurrentUserId } from "./utils";

export async function submitSelfAssessment(formData: FormData) {
  const userId = await getCurrentUserId();
  const cycle = formData.get("cycle") as string;

  const parsed = SelfAssessmentSchema.safeParse({
    achievements: formData.get("achievements"),
    challenges: formData.get("challenges"),
    future_goals: formData.get("future_goals"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { achievements, challenges, future_goals } = parsed.data;

  try { 
    const userQuery =
      await sql`SELECT manager_id FROM users WHERE id = ${userId}`;
    const managerId = userQuery[0]?.manager_id;

    await sql`
      UPDATE self_assessments
      SET
        achievements = ${achievements},
        challenges = ${challenges},
        future_goals = ${future_goals},
        submitted = TRUE,
        submitted_at = NOW()
      WHERE user_id = ${userId} AND cycle = ${cycle}
    `;

    await sql`
      UPDATE performance_notifications 
      SET is_read = true 
      WHERE user_id = ${userId} AND type = 'Assessment' AND is_read = false
    `;
 
    if (managerId) {
      await sql`
        INSERT INTO performance_notifications (user_id, requester_id, title, description, type, is_read)
        VALUES (${managerId}, ${userId}, 'Assessment Submitted', 'An employee has submitted their self-assessment for review.', 'Review', false)
      `;
    }

    revalidatePath("/my-profile/performance");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Submit Error:", error);
    return { success: false };
  }
}

export async function reopenSelfAssessment() {
  const userId = await getCurrentUserId();

  await sql`
    UPDATE self_assessments
    SET
      submitted = FALSE,
      submitted_at = NULL
    WHERE user_id = ${userId}
  `;

  revalidatePath("/my-profile/performance");

  return {
    success: true,
  };
}

export async function saveSelfAssessmentDraft(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
 
    const cycle = formData.get("cycle") as string;
    const achievements = formData.get("achievements") as string;
    const challenges = formData.get("challenges") as string;
    const futureGoals = formData.get("future_goals") as string;
 
    await sql`
      UPDATE self_assessments
      SET 
        achievements = ${achievements},
        challenges = ${challenges},
        future_goals = ${futureGoals},
        submitted = false
      WHERE user_id = ${userId} AND cycle = ${cycle}
    `;

    revalidatePath("/my-profile/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to save self-assessment draft:", error);
    return { success: false };
  }
}
