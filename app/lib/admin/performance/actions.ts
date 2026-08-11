// @/app/lib/admin/performance/actions.ts
"use server";

import { z } from "zod";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Define the validation schema
const GoalSchema = z.object({
  userId: z.string().min(1, "Please select an employee."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  priority: z.enum(["High", "Medium", "Low"], {
    message: "Please select a valid priority level.",
  }),
  dueDate: z.string().min(1, "Please select a due date."),
});

export type GoalFormState = {
  errors?: {
    userId?: string[];
    title?: string[];
    priority?: string[];
    dueDate?: string[];
  };
  message?: string | null;
};

// 2. The Server Action
export async function createNewGoal(formData: FormData): Promise<void> {
  // Validate form fields using Zod
  const validatedFields = GoalSchema.safeParse({
    userId: formData.get("userId"),
    title: formData.get("title"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  });

  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
    return;
  }

  const { userId, title, priority, dueDate } = validatedFields.data;

  try {
    await db`
      INSERT INTO user_goals (user_id, title, priority, due_date, progress, status)
      VALUES (${userId}, ${title}, ${priority}, ${dueDate}, 0, 'In Progress')
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return;
  }

  // Revalidate the cache for the performance overview and redirect
  revalidatePath("/dashboard/performance");
  redirect("/dashboard/performance");
}
