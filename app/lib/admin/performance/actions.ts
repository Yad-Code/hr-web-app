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
    console.error(
      "Validation Error:",
      validatedFields.error.flatten().fieldErrors,
    );
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
 
const ReviewSchema = z.object({
  userId: z.string().min(1, "Please select an employee."),
  period: z.string().min(1, "Review period is required."),
  date: z.string().min(1, "Date is required."),
  reviewer: z.string().min(1, "Reviewer name is required."),
  rating: z.coerce.number().min(1).max(5), // coerces string to number
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  managerComments: z.string().optional(),
  employeeComments: z.string().optional(),
  goalsForNextCycle: z.string().optional(),
});

export async function createNewReview(formData: FormData): Promise<void> {
  const validatedFields = ReviewSchema.safeParse({
    userId: formData.get("userId"),
    period: formData.get("period"),
    date: formData.get("date"),
    reviewer: formData.get("reviewer"),
    rating: formData.get("rating"),
    strengths: formData.get("strengths"),
    improvements: formData.get("improvements"),
    managerComments: formData.get("managerComments"),
    employeeComments: formData.get("employeeComments"),
    goalsForNextCycle: formData.get("goalsForNextCycle"),
  });

  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
    return;
  }

  const {
    userId, period, date, reviewer, rating, 
    strengths, improvements, managerComments, employeeComments, goalsForNextCycle
  } = validatedFields.data;

  try {
    await db`
      INSERT INTO performance_reviews (
        user_id, period, date, reviewer, rating, 
        strengths, improvements, manager_comments, employee_comments, goals_for_next_cycle, status
      )
      VALUES (
        ${userId}, ${period}, ${date}, ${reviewer}, ${rating}, 
        ${strengths || null}, ${improvements || null}, ${managerComments || null}, 
        ${employeeComments || null}, ${goalsForNextCycle || null}, 'Completed'
      )
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return;
  }

  revalidatePath("/dashboard/performance/reviews");
  redirect("/dashboard/performance/reviews");
}

