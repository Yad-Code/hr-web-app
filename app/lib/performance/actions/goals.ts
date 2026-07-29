"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { GoalSchema } from "../validations";
import { getCurrentUserId } from "./utils";
import { NewGoalData } from "@/app/lib/performance/definitions"; // Import type

export async function updateGoal(
  goalId: string,
  formData: FormData
) {
  const userId = await getCurrentUserId();

  const parsed = GoalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    description,
    priority,
    due_date,
  } = parsed.data;

  await sql`
    UPDATE user_goals
    SET
      title=${title},
      description=${description},
      priority=${priority},
      due_date=${due_date},
      updated_at=NOW()
    WHERE
      id=${goalId}
      AND user_id=${userId}
  `;

  revalidatePath("/my-profile/performance");

  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const userId = await getCurrentUserId();

  await sql`
    DELETE FROM user_goals
    WHERE
      id=${goalId}
      AND user_id=${userId}
  `;

  revalidatePath("/my-profile/performance");

  return {
    success: true,
  };
}

export async function updateGoalProgress(
  goalId: string,
  progress: number
) {
  const userId = await getCurrentUserId();

  let status = "In Progress";

  if (progress === 100) {
    status = "Completed";
  }

  await sql`
    UPDATE user_goals
    SET
      progress=${progress},
      status=${status},
      updated_at=NOW()
    WHERE
      id=${goalId}
      AND user_id=${userId}
  `;

  revalidatePath("/my-profile/performance");

  return {
    success: true,
  };
}

export async function addGoal(goal: NewGoalData) {
  try {
    const userId = await getCurrentUserId();

    await sql`
      INSERT INTO user_goals (user_id, title, description, priority, due_date, progress, status)
      VALUES (
        ${userId},
        ${goal.title},
        ${goal.description || null},
        ${goal.priority},
        ${goal.due_date},
        0,
        'In Progress'
      )
    `;

    revalidatePath("/my-profile/performance");

    return { success: true };
  } catch (error) {
    console.error("Failed to add goal:", error);
    throw new Error("Failed to create goal.");
  }
}