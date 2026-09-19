// @/app/lib/employeeDashboard/performance/actions.ts
"use server";

import { auth } from "@/auth";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

// --- SKILLS ---
export async function updateSkillLevel(skillId: string, level: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db`UPDATE skills SET level = ${level} WHERE id = ${skillId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
}

export async function addSkill(skill: {
  name: string;
  label: string;
  level: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db`INSERT INTO skills (user_id, name, label, level) VALUES (${session.user.id}::uuid, ${skill.name}, ${skill.label}, ${skill.level})`;
  revalidatePath("/my-profile/performance");
}

export async function deleteSkill(skillId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db`DELETE FROM skills WHERE id = ${skillId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
}

// --- GOALS ---
export async function updateGoalProgress(goalId: string, progress: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db`UPDATE user_goals SET progress = ${progress} WHERE id = ${goalId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
}

// 👇 FIXED: Added ? to description
export async function addGoal(goal: {
  title: string;
  description?: string;
  priority: string;
  due_date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db`INSERT INTO user_goals (user_id, title, description, priority, due_date, progress, status) 
           VALUES (${session.user.id}::uuid, ${goal.title}, ${goal.description || null}, ${goal.priority}, ${goal.due_date}, 0, 'In Progress')`;
  revalidatePath("/my-profile/performance");
}

export async function updateGoal(goalId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, errors: { auth: ["Unauthorized"] } };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const due_date = formData.get("due_date") as string;

  if (!title || !due_date)
    return {
      success: false,
      errors: {
        title: ["Title is required"],
        due_date: ["Due date is required"],
      },
    };

  await db`UPDATE user_goals SET title = ${title}, description = ${description || null}, priority = ${priority}, due_date = ${due_date} 
           WHERE id = ${goalId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
  return { success: true };
}

// --- CAREER & 1:1 MEETINGS ---
// 👇 FIXED: Added ? to roadmap
export async function updateCareerPlan(data: {
  current_position: string;
  target_position: string;
  target_date: string;
  roadmap?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db`
    INSERT INTO career_development (user_id, current_position, target_position, target_date, roadmap) 
    VALUES (${session.user.id}::uuid, ${data.current_position}, ${data.target_position}, ${data.target_date}, ${data.roadmap || null})
    ON CONFLICT (user_id) DO UPDATE SET 
      current_position = EXCLUDED.current_position, 
      target_position = EXCLUDED.target_position, 
      target_date = EXCLUDED.target_date, 
      roadmap = EXCLUDED.roadmap
  `;
  revalidatePath("/my-profile/performance");
}

// 👇 FIXED: Added ? to notes
export async function requestOneOnOne(data: {
  topic: string;
  meeting_date: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const managerQuery =
    await db`SELECT manager_id FROM users WHERE id = ${session.user.id}::uuid`;
  const managerId = managerQuery[0]?.manager_id;

  await db`INSERT INTO one_on_one_meetings (employee_id, manager_id, topic, meeting_date, notes, status) 
           VALUES (${session.user.id}::uuid, ${managerId ? `${managerId}::uuid` : null}, ${data.topic}, ${data.meeting_date}, ${data.notes || null}, 'Scheduled')`;
  revalidatePath("/my-profile/performance");
}

// --- FEEDBACK ---
export async function markFeedbackAsRead(feedbackId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await db`UPDATE user_feedback SET is_read = true WHERE id = ${feedbackId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
}

export async function markAllFeedbackAsRead() {
  const session = await auth();
  if (!session?.user?.id) return;
  await db`UPDATE user_feedback SET is_read = true WHERE user_id = ${session.user.id}::uuid AND is_read = false`;
  revalidatePath("/my-profile/performance");
}

export async function requestFeedback(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const recipient = formData.get("recipient") as string;
  const type = formData.get("type") as string;
  const message = formData.get("message") as string;

  if (!recipient || !message)
    return { success: false, error: "Missing required fields" };

  const userQuery = await db`SELECT id FROM users WHERE email = ${recipient}`;
  if (!userQuery.length)
    return { success: false, error: "Recipient not found." };

  await db`INSERT INTO performance_notifications (user_id, requester_id, title, description, type) 
           VALUES (${userQuery[0].id}::uuid, ${session.user.id}::uuid, 'Feedback Request', ${message}, 'Feedback')`;
  return { success: true };
}

// --- REVIEWS ---
export async function updateEmployeeComments(
  reviewId: string,
  comments: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await db`UPDATE performance_reviews SET employee_comments = ${comments} WHERE id = ${reviewId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
  return { success: true };
}

export async function acknowledgeReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await db`UPDATE performance_reviews SET acknowledged = true, acknowledged_at = NOW() WHERE id = ${reviewId}::uuid AND user_id = ${session.user.id}::uuid`;
  revalidatePath("/my-profile/performance");
  return { success: true };
}

// --- SELF ASSESSMENT ---
export async function submitSelfAssessment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const cycle = formData.get("cycle") as string;
  const achievements = formData.get("achievements") as string;
  const challenges = formData.get("challenges") as string;
  const future_goals = formData.get("future_goals") as string;

  await db`UPDATE self_assessments SET achievements = ${achievements}, challenges = ${challenges}, future_goals = ${future_goals}, submitted = true, submitted_at = NOW() 
           WHERE user_id = ${session.user.id}::uuid AND cycle = ${cycle}`;
  revalidatePath("/my-profile/performance");
  return { success: true };
}

export async function saveSelfAssessmentDraft(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const cycle = formData.get("cycle") as string;
  const achievements = formData.get("achievements") as string;
  const challenges = formData.get("challenges") as string;
  const future_goals = formData.get("future_goals") as string;

  await db`UPDATE self_assessments SET achievements = ${achievements}, challenges = ${challenges}, future_goals = ${future_goals} 
           WHERE user_id = ${session.user.id}::uuid AND cycle = ${cycle}`;
  revalidatePath("/my-profile/performance");
  return { success: true };
}

export async function reopenSelfAssessment() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await db`UPDATE self_assessments SET submitted = false, submitted_at = NULL WHERE user_id = ${session.user.id}::uuid AND submitted = true`;
  revalidatePath("/my-profile/performance");
  return { success: true };
}
