"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { SelfAssessmentSchema } from "../validations";
import { getCurrentUserId } from "./utils";

export async function submitSelfAssessment(
  formData: FormData
) {
  const userId = await getCurrentUserId();

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

  const {
    achievements,
    challenges,
    future_goals,
  } = parsed.data;

  await sql`
    UPDATE self_assessments
    SET
      achievements = ${achievements},
      challenges = ${challenges},
      future_goals = ${future_goals},
      submitted = TRUE,
      submitted_at = NOW()
    WHERE user_id = ${userId}
  `;

  revalidatePath("/my-profile/performance");

  return {
    success: true,
  };
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