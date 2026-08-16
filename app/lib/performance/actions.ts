// @/app/lib/performance/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

export async function createEmployeeGoal(formData: FormData) {
  const userId = formData.get("user_id") as string;
  const title = formData.get("title") as string;
  const priority = formData.get("priority") as string;
  const dueDate = formData.get("due_date") as string;

  await db`
    INSERT INTO user_goals (user_id, title, progress, status, priority, due_date)
    VALUES (${userId}, ${title}, 0, 'In Progress', ${priority}, ${dueDate})
  `;

  revalidatePath("/dashboard/performance");
}
 
export async function scheduleMeeting(
  employeeId: string,
  meetingDate: string,
  topic: string,
) {
  await db`
    INSERT INTO one_on_one_meetings (employee_id, meeting_date, topic, status)
    VALUES (${employeeId}, ${meetingDate}, ${topic}, 'Scheduled')
  `;

  revalidatePath("/dashboard/performance");
}
