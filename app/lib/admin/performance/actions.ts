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
    console.error(
      "Validation Error:",
      validatedFields.error.flatten().fieldErrors,
    );
    return;
  }

  const {
    userId,
    period,
    date,
    reviewer,
    rating,
    strengths,
    improvements,
    managerComments,
    employeeComments,
    goalsForNextCycle,
  } = validatedFields.data;

  // Derive status based on rating score
  const status =
    rating >= 4.5 ? "Excellent" : rating >= 3.5 ? "Good" : "Needs Improvement";

  // Calculate next review date (defaulting to 6 months after current review date)
  const evalDate = new Date(date);
  evalDate.setMonth(evalDate.getMonth() + 6);
  const nextReviewDate = evalDate.toISOString().split("T")[0];

  try {
    // 1. Insert the detailed performance review record
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

    // 2. Sync / Upsert the top-level user_performance summary for the header
    await db`
      INSERT INTO user_performance (user_id, rating, cycle, next_review, status)
      VALUES (${userId}, ${rating}, ${period}, ${nextReviewDate}, ${status})
      ON CONFLICT (user_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        cycle = EXCLUDED.cycle,
        next_review = EXCLUDED.next_review,
        status = EXCLUDED.status
    `;

    // 3. Notify the employee
    const notificationDesc = `A new performance review for ${period} has been published by ${reviewer}.`;
    await db`
      INSERT INTO performance_notifications (
        user_id, title, description, type, is_read
      )
      VALUES (
        ${userId}, 'New Performance Review', ${notificationDesc}, 'Review', false
      )
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return;
  }

  // 4. Invalidate cache globally so header & tab refresh instantly
  revalidatePath("/", "layout");
  redirect("/dashboard/performance/reviews");
}

export async function updateMeetingStatus(meetingId: string, status: string) {
  try {
    await db`
      UPDATE one_on_one_meetings 
      SET status = ${status} 
      WHERE id = ${meetingId}
    `;

    revalidatePath(`/dashboard/performance/meetings/${meetingId}`);
    revalidatePath(`/dashboard/performance/meetings`);
    revalidatePath(`/dashboard/performance`);
    return { success: true, message: `Meeting marked as ${status}.` };
  } catch (error) {
    console.error("Failed to update meeting status:", error);
    return { success: false, message: "Failed to update status." };
  }
}

export async function scheduleOneOnOneMeeting(
  formData: FormData,
): Promise<void> {
  const employee_id = formData.get("employee_id") as string;
  const manager_id = formData.get("manager_id") as string;
  const meeting_date = formData.get("meeting_date") as string;
  const topic = formData.get("topic") as string;
  const notes = formData.get("notes") as string;
  const action_items = formData.get("action_items") as string; // <-- Extract action items

  if (!employee_id || !manager_id || !meeting_date) {
    return;
  }

  try {
    await db`
      INSERT INTO one_on_one_meetings (
        employee_id,
        manager_id,
        meeting_date,
        topic,
        notes,
        action_items,    
        status
      ) VALUES (
        ${employee_id},
        ${manager_id},
        ${meeting_date},
        ${topic || "1-on-1 Sync"},
        ${notes || null},
        ${action_items || null}, 
        'Scheduled'
      )
    `;

    revalidatePath("/dashboard/performance/meetings");
    revalidatePath("/dashboard/performance");
  } catch (error) {
    console.error("Failed to schedule meeting:", error);
    return;
  }

  redirect("/dashboard/performance/meetings");
}
