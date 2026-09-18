// @/app/lib/admin/performance/actions.ts
"use server";

import { z } from "zod";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { verifyAccess } from "@/app/lib/auth/access-control";

const ReviewSchema = z.object({
  userId: z.string().min(1, "Please select an employee."),
  period: z.string().min(1, "Review period is required."),
  date: z.string().min(1, "Date is required."),
  reviewer: z.string().min(1, "Reviewer name is required."),
  rating: z.coerce.number().min(1).max(5),
  productivity: z.coerce.number().min(1).max(100),
  quality: z.coerce.number().min(1).max(100),
  teamwork: z.coerce.number().min(1).max(100),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  managerComments: z.string().optional(),
  employeeComments: z.string().optional(),
  goalsForNextCycle: z.string().optional(),
});

const GoalSchema = z.object({
  userId: z.string().min(1, "Please select an employee."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  priority: z.enum(["High", "Medium", "Low"], {
    message: "Please select a valid priority level.",
  }),
  dueDate: z.string().min(1, "Please select a due date."),
});

export async function createNewGoal(formData: FormData): Promise<void> {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return;

  const validatedFields = GoalSchema.safeParse({
    userId: formData.get("userId"),
    title: formData.get("title"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  });

  if (!validatedFields.success) return;
  const { userId, title, priority, dueDate } = validatedFields.data;

  // ABAC Check
  const isAuthorized = await verifyAccess(actorId, "start_reviews", userId);
  if (!isAuthorized) {
    console.error("Forbidden: You lack permission to assign goals.");
    return;
  }

  try {
    await db`
      INSERT INTO user_goals (user_id, title, priority, due_date, progress, status)
      VALUES (${userId}::uuid, ${title}, ${priority}, ${dueDate}, 0, 'In Progress')
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return;
  }

  revalidatePath("/dashboard/performance");
  redirect("/dashboard/performance");
}

export async function createNewReview(formData: FormData): Promise<void> {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return;

  const validatedFields = ReviewSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) return;

  const {
    userId,
    period,
    date,
    reviewer,
    rating,
    productivity,
    quality,
    teamwork,
    strengths,
    improvements,
    managerComments,
    employeeComments,
    goalsForNextCycle,
  } = validatedFields.data;

  // ABAC Check
  const isAuthorized = await verifyAccess(actorId, "start_reviews", userId);
  if (!isAuthorized) return;

  const status =
    rating >= 4.5 ? "Excellent" : rating >= 3.5 ? "Good" : "Needs Improvement";
  const evalDate = new Date(date);
  evalDate.setMonth(evalDate.getMonth() + 6);
  const nextReviewDate = evalDate.toISOString().split("T")[0];
  const targetMonth = `${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1).padStart(2, "0")}-01`;

  try {
    await db`
      INSERT INTO performance_reviews (user_id, period, date, reviewer, rating, strengths, improvements, manager_comments, employee_comments, goals_for_next_cycle, status)
      VALUES (${userId}::uuid, ${period}, ${date}, ${reviewer}, ${rating}, ${strengths || null}, ${improvements || null}, ${managerComments || null}, ${employeeComments || null}, ${goalsForNextCycle || null}, 'Completed')
    `;

    await db`
      INSERT INTO user_performance (user_id, rating, cycle, next_review, status)
      VALUES (${userId}::uuid, ${rating}, ${period}, ${nextReviewDate}, ${status})
      ON CONFLICT (user_id) DO UPDATE SET rating = EXCLUDED.rating, cycle = EXCLUDED.cycle, next_review = EXCLUDED.next_review, status = EXCLUDED.status
    `;

    await db`
      INSERT INTO performance_history (user_id, month, productivity, quality, teamwork)
      VALUES (${userId}::uuid, ${targetMonth}, ${productivity}, ${quality}, ${teamwork})
      ON CONFLICT (user_id, month) DO UPDATE SET productivity = EXCLUDED.productivity, quality = EXCLUDED.quality, teamwork = EXCLUDED.teamwork
    `;

    await db`
      INSERT INTO performance_notifications (user_id, title, description, type, is_read)
      VALUES (${userId}::uuid, 'New Performance Review', ${`A new review for ${period} was published by${reviewer}.`}, 'Review', false)
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/performance/reviews");
}

export async function updateMeetingStatus(meetingId: string, status: string) {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return { success: false, message: "Unauthorized." };

  try {
    const meetingData =
      await db`SELECT employee_id FROM one_on_one_meetings WHERE id = ${meetingId}::uuid`;
    if (meetingData.length === 0)
      return { success: false, message: "Meeting not found." };

    const employeeId = meetingData[0].employee_id as string;

    // ABAC Check
    const isAuthorized = await verifyAccess(
      actorId,
      "start_reviews",
      employeeId,
    );
    if (!isAuthorized) return { success: false, message: "Forbidden." };

    await db`UPDATE one_on_one_meetings SET status = ${status} WHERE id = ${meetingId}::uuid`;

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
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return;

  const employee_id = formData.get("employee_id") as string;
  const manager_id = formData.get("manager_id") as string;
  const meeting_date = formData.get("meeting_date") as string;
  const topic = formData.get("topic") as string;
  const notes = formData.get("notes") as string;
  const action_items = formData.get("action_items") as string;

  if (!employee_id || !manager_id || !meeting_date) return;

  const isAuthorized = await verifyAccess(
    actorId,
    "start_reviews",
    employee_id,
  );
  if (!isAuthorized) return;

  try {
    await db`
      INSERT INTO one_on_one_meetings (employee_id, manager_id, meeting_date, topic, notes, action_items, status) 
      VALUES (${employee_id}::uuid, ${manager_id}::uuid, ${meeting_date}, ${topic || "1-on-1 Sync"}, ${notes || null}, ${action_items || null}, 'Scheduled')
    `;
    revalidatePath("/dashboard/performance/meetings");
    revalidatePath("/dashboard/performance");
  } catch (error) {
    console.error("Failed to schedule meeting:", error);
    return;
  }
  redirect("/dashboard/performance/meetings");
}

export async function approveLeaveRequest(requestId: string) {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return { success: false, error: "Unauthorized." };

  try {
    const requestResult =
      await db`SELECT * FROM leave_requests WHERE id = ${requestId}::uuid`;
    if (requestResult.length === 0)
      return { success: false, error: "Request not found." };

    const request = requestResult[0];
    const userId = request.user_id as string;

    const isAuthorized = await verifyAccess(actorId, "approve_leaves", userId);
    if (!isAuthorized)
      return {
        success: false,
        error: "Forbidden: You lack permission to approve leaves.",
      };

    await db`UPDATE leave_requests SET status = 'Approved' WHERE id = ${requestId}::uuid`;

    if (request.type === "exchange" && request.helper_id) {
      await db`
        INSERT INTO schedule_overrides (user_id, target_date, is_working, notes)
        VALUES (${userId}::uuid, ${request.original_date}, false, 'Shift given to helper'),
               (${userId}::uuid, ${request.exchange_date}, true, 'Shift taken from helper')
        ON CONFLICT (user_id, target_date) DO UPDATE SET is_working = EXCLUDED.is_working
      `;
      await db`
        INSERT INTO schedule_overrides (user_id, target_date, is_working, notes)
        VALUES (${request.helper_id}::uuid, ${request.original_date}, true, 'Covering requester shift'),
               (${request.helper_id}::uuid, ${request.exchange_date}, false, 'Shift given to requester')
        ON CONFLICT (user_id, target_date) DO UPDATE SET is_working = EXCLUDED.is_working
      `;
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve request:", error);
    return { success: false, error: "Database transaction failed." };
  }
}

export async function createNewFeedback(formData: FormData): Promise<void> {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return;

  const userId = formData.get("userId") as string;
  const type = formData.get("type") as string;
  const text = formData.get("text") as string;

  const isAuthorized = await verifyAccess(actorId, "log_feedback", userId);
  if (!isAuthorized) return;

  const senderName = session.user.name as string;
  const senderRole = (await verifyAccess(actorId, "manage_system", actorId))
    ? "HR Admin"
    : "Manager";

  try {
    await db`
      INSERT INTO user_feedback (user_id, sender, role, date, type, text, is_read)
      VALUES (${userId}::uuid, ${senderName}, ${senderRole}, NOW(), ${type}, ${text}, false)
    `;
    await db`
      INSERT INTO performance_notifications (user_id, title, description, type, is_read)
      VALUES (${userId}::uuid, 'New Feedback Received', ${`You received new ${type.toLowerCase()} feedback from${senderName}.`}, 'Feedback', false)
    `;
  } catch (error) {
    console.error("Database Error logging feedback:", error);
    return;
  }

  revalidatePath("/dashboard/performance");
  revalidatePath("/dashboard/performance/feedback");
  redirect("/dashboard/performance/feedback");
}

export async function initiateSelfAssessmentCycle(formData: FormData) {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return { success: false, error: "Unauthorized." };

  const isAuthorized = await verifyAccess(actorId, "manage_system", actorId);
  if (!isAuthorized)
    return {
      success: false,
      error: "Forbidden: Only System Administrators can initiate cycles.",
    };

  const cycleName = formData.get("cycleName") as string;
  if (!cycleName || cycleName.trim() === "")
    return { success: false, error: "Cycle name is required." };

  try {
    const employees =
      await db`SELECT id FROM users WHERE role IN ('employee', 'manager') AND status = 'Active'`;
    if (employees.length === 0)
      return { success: false, error: "No active employees found." };

    for (const emp of employees) {
      const insertResult = await db`
        INSERT INTO self_assessments (user_id, cycle, submitted)
        VALUES (${emp.id}::uuid, ${cycleName}, false)
        ON CONFLICT (user_id, cycle) DO NOTHING
        RETURNING id
      `;

      if (insertResult.length > 0) {
        await db`
          INSERT INTO performance_notifications (user_id, title, description, type, is_read)
          VALUES (${emp.id}::uuid, 'New Self-Assessment Cycle', ${`The ${cycleName} self-assessment cycle is now open.`}, 'Assessment', false)
        `;
      }
    }

    revalidatePath("/dashboard/performance");
    return { success: true };
  } catch (error) {
    console.error("Failed to initiate assessment cycle:", error);
    return { success: false, error: "Failed to initiate the cycle." };
  }
}

export async function resetAllLeaveBalances() {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return { success: false, message: "Unauthorized." };

  const isAuthorized = await verifyAccess(actorId, "manage_system", actorId);
  if (!isAuthorized)
    return {
      success: false,
      message: "Forbidden: Only admins can perform this action.",
    };

  try {
    await db`UPDATE leave_balances SET annual_remaining = annual_total, sick_remaining = sick_total, monthly_remaining_hours = monthly_total_hours`;
    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "All employee leave balances have been reset.",
    };
  } catch (error) {
    console.error("Failed to reset leave balances:", error);
    return {
      success: false,
      message: "Database error: Failed to reset balances.",
    };
  }
}
