"use server";

import { sql } from "@/app/lib/employee/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./utils";

export async function updateSkillLevel(
  skillId: string,
  level: number
) {
  const userId = await getCurrentUserId();

  await sql`
    UPDATE user_skills
    SET level = ${level}
    WHERE
      id = ${skillId}
      AND user_id = ${userId}
  `;

  revalidatePath("/my-profile/performance");

  return {
    success: true,
  };
}