"use server";

import { sql } from "@/app/lib/employee/db";
import { getCurrentUserId } from "./utils";

export async function getMyKPIs() {
  const userId = await getCurrentUserId();

  return await sql`
    SELECT *
    FROM user_kpis
    WHERE user_id = ${userId}
    ORDER BY label
  `;
}