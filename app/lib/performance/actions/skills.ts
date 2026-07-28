"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

interface AddSkillInput {
  name: string;
  label: string;
  level?: number;
}

/**
 * Updates an existing skill's proficiency level for the authenticated user.
 */
export async function updateSkillLevel(skillId: string, level: number): Promise<void> {
  const userId = await getCurrentUserId();

  try {
    await sql`
      UPDATE skills
      SET level = ${level}
      WHERE id = ${skillId} AND user_id = ${userId}
    `;

    revalidatePath("/my-profile/performance");
  } catch (error) {
    console.error("Failed to update skill level:", error);
    throw new Error("Failed to update skill level.");
  }
}

/**
 * Creates and assigns a new skill entry for the authenticated user.
 */
export async function addSkill({ name, label, level = 1 }: AddSkillInput): Promise<void> {
  const userId = await getCurrentUserId();

  try {
    await sql`
      INSERT INTO skills (user_id, name, label, level)
      VALUES (${userId}, ${name}, ${label}, ${level})
    `;

    revalidatePath("/my-profile/performance");
  } catch (error) {
    console.error("Failed to add skill:", error);
    throw new Error("Failed to add new skill.");
  }
}