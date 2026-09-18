// @/app/lib/admin/performance/data.ts

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";
import { verifyAccess } from "@/app/lib/auth/access-control";
import {
  SelfAssessment,
  ReviewRow,
  GoalRow,
  MeetingRow,
  FeedbackRow,
  FeedbackRequestRow,
  PerformanceKpiData,
} from "@/app/lib/employeeDashboard/performance/definitions";

export interface AdminMeetingDetail {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  manager_id: string | null;
  manager_name: string | null;
  meeting_date: string | Date;
  topic: string | null;
  notes: string | null;
  action_items: string | null;
  status: string;
  created_at: string | Date;
}

export interface EmployeeOption {
  id: string;
  name: string;
  department: string;
}

const authUsersCTE = (actorId: string) => db`
  WITH auth_users AS (
    SELECT DISTINCT u.id FROM users u
    JOIN user_permissions up ON up.user_id = ${actorId}::uuid
    JOIN permissions p ON p.id = up.permission_id
    WHERE p.action IN ('view_dashboard', 'start_reviews', 'log_feedback')
      AND (
        up.scope = 'global' OR
        (up.scope = 'branch' AND u.branch = up.target_branch) OR
        (up.scope = 'department' AND u.department = up.target_department) OR
        (up.scope = 'team' AND u.manager_id = ${actorId}::uuid) OR
        (up.scope = 'self' AND u.id = ${actorId}::uuid)
      )
  )
`;

export async function getPerformanceDashboardData(actorId: string) {
  try {
    const isGlobalAdmin = await verifyAccess(actorId, "manage_system", actorId);

    const [
      feedbackRes,
      requestsRes,
      kpiRes,
      reviewsRes,
      goalsRes,
      meetingsRes,
    ] = await Promise.all([
      db<FeedbackRow[]>`
        ${authUsersCTE(actorId)}
        SELECT uf.id, uf.type, uf.text, uf.sender, uf.role, uf.date, u.name as recipient_name, u.image_url as recipient_image
        FROM user_feedback uf JOIN users u ON uf.user_id = u.id
        WHERE u.id IN (SELECT id FROM auth_users)
        ORDER BY uf.date DESC LIMIT 5
      `,
      db<FeedbackRequestRow[]>`
        ${authUsersCTE(actorId)}
        SELECT pn.id, pn.title, pn.description, pn.created_at 
        FROM performance_notifications pn JOIN users u ON pn.user_id = u.id
        WHERE pn.type = 'Feedback Request' AND pn.is_read = false 
        AND u.id IN (SELECT id FROM auth_users)
        ORDER BY pn.created_at DESC LIMIT 5
      `,
      db`
        ${authUsersCTE(actorId)}
        SELECT 
          (SELECT ROUND(AVG(rating), 1) FROM performance_reviews WHERE user_id IN (SELECT id FROM auth_users)) as avg_rating,
          (SELECT COUNT(*) FROM performance_reviews WHERE status = 'Completed' AND user_id IN (SELECT id FROM auth_users)) as completed_reviews,
          (SELECT COUNT(*) FROM performance_reviews WHERE status != 'Completed' AND user_id IN (SELECT id FROM auth_users)) as pending_reviews,
          (SELECT COUNT(*) FROM user_goals WHERE status = 'In Progress' AND user_id IN (SELECT id FROM auth_users)) as active_goals,
          (SELECT COUNT(*) FROM self_assessments WHERE submitted = true AND user_id IN (SELECT id FROM auth_users)) as submitted_assessments
      `,
      db<ReviewRow[]>`
        ${authUsersCTE(actorId)}
        SELECT pr.id, pr.period, pr.date, pr.reviewer, pr.rating, pr.status, u.name as employee_name, COALESCE(u.department, 'General') as department, u.image_url
        FROM performance_reviews pr JOIN users u ON pr.user_id = u.id
        WHERE u.id IN (SELECT id FROM auth_users)
        ORDER BY pr.date DESC LIMIT 5
      `,
      db<GoalRow[]>`
        ${authUsersCTE(actorId)}
        SELECT ug.id, ug.title, ug.progress, ug.priority, ug.due_date, ug.status, u.name as employee_name
        FROM user_goals ug JOIN users u ON ug.user_id = u.id
        WHERE ug.status != 'Completed' AND u.id IN (SELECT id FROM auth_users)
        ORDER BY ug.due_date ASC LIMIT 5
      `,
      db<MeetingRow[]>`
        ${authUsersCTE(actorId)}
        SELECT m.id, m.meeting_date, m.topic, m.status, u.name as employee_name, COALESCE(u.department, 'General') as department
        FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
        WHERE m.status != 'Completed' AND u.id IN (SELECT id FROM auth_users)
        ORDER BY m.meeting_date ASC LIMIT 5
      `,
    ]);

    const today = new Date();
    const kpiStats: PerformanceKpiData = {
      avgRating: String(kpiRes[0]?.avg_rating ?? "0.0"),
      completedReviews: String(kpiRes[0]?.completed_reviews ?? "0"),
      pendingReviews: String(kpiRes[0]?.pending_reviews ?? "0"),
      activeGoals: String(kpiRes[0]?.active_goals ?? "0"),
      submittedAssessments: String(kpiRes[0]?.submitted_assessments ?? "0"),
      currentQuarter: `Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`,
    };

    return {
      isGlobalAdmin,
      kpiStats,
      recentFeedback: feedbackRes,
      pendingRequests: requestsRes,
      recentReviews: reviewsRes,
      teamGoals: goalsRes,
      upcomingSyncs: meetingsRes,
    };
  } catch (error) {
    console.error("Failed to fetch performance dashboard data:", error);
    throw error;
  }
}

export async function getAdminUpcomingSyncs(): Promise<MeetingRow[]> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return [];

    return await db<MeetingRow[]>`
      ${authUsersCTE(actorId)}
      SELECT m.id, m.meeting_date, m.topic, m.status, u.name AS employee_name, COALESCE(u.department, 'General') AS department
      FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
      WHERE m.meeting_date >= CURRENT_DATE AND u.id IN (SELECT id FROM auth_users)
      ORDER BY m.meeting_date ASC LIMIT 5
    `;
  } catch (error) {
    console.error("Failed to fetch admin upcoming syncs:", error);
    return [];
  }
}

export async function getAllAdminMeetings(): Promise<MeetingRow[]> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return [];

    return await db<MeetingRow[]>`
      ${authUsersCTE(actorId)}
      SELECT m.id, m.meeting_date, m.topic, m.status, u.name AS employee_name, COALESCE(u.department, 'General') AS department
      FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
      WHERE u.id IN (SELECT id FROM auth_users)
      ORDER BY m.meeting_date DESC
    `;
  } catch (error) {
    console.error("Failed to fetch all admin meetings:", error);
    return [];
  }
}

export async function getMeetingDetailsById(
  id: string,
): Promise<AdminMeetingDetail | null> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return null;

    const rows = await db<AdminMeetingDetail[]>`
      SELECT 
        m.id, m.employee_id, m.manager_id, m.meeting_date, m.topic, m.notes, m.action_items, m.status, m.created_at,
        emp.name AS employee_name, emp.email AS employee_email, COALESCE(emp.department, 'General') AS department,
        mgr.name AS manager_name
      FROM one_on_one_meetings m
      JOIN users emp ON m.employee_id = emp.id
      LEFT JOIN users mgr ON m.manager_id = mgr.id
      WHERE m.id = ${id}::uuid
    `;

    if (!rows.length) return null;

    const isAuthorized = await verifyAccess(
      actorId,
      "view_dashboard",
      rows[0].employee_id,
    );
    if (!isAuthorized) return null;

    return rows[0];
  } catch (error) {
    console.error("Failed to fetch meeting details:", error);
    return null;
  }
}

export async function getEmployeesList(): Promise<EmployeeOption[]> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return [];

    return await db<EmployeeOption[]>`
      ${authUsersCTE(actorId)}
      SELECT id, name, COALESCE(department, 'General') AS department 
      FROM users 
      WHERE id IN (SELECT id FROM auth_users)
      ORDER BY name ASC
    `;
  } catch (error) {
    console.error("Failed to fetch employees list:", error);
    return [];
  }
}

export async function getEmployeeSelfAssessment(
  employeeId: string,
  cycle: string,
): Promise<SelfAssessment | null> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return null;

    const requiredAction =
      actorId === employeeId ? "edit_personal_profile" : "view_dashboard";
    const isAuthorized = await verifyAccess(
      actorId,
      requiredAction,
      employeeId,
    );
    if (!isAuthorized) return null;

    const data = await db<SelfAssessment[]>`
      SELECT * FROM self_assessments
      WHERE user_id = ${employeeId}::uuid AND cycle = ${cycle}
      LIMIT 1
    `;

    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Failed to fetch employee self-assessment:", error);
    return null;
  }
}

export async function getCompanyFeedback(): Promise<FeedbackRow[]> {
  try {
    const session = await auth();
    const actorId = session?.user?.id;
    if (!actorId) return [];

    return await db<FeedbackRow[]>`
      ${authUsersCTE(actorId)}
      SELECT uf.*, u.name as recipient_name, u.image_url as recipient_image 
      FROM user_feedback uf 
      JOIN users u ON uf.user_id = u.id 
      WHERE u.id IN (SELECT id FROM auth_users)
      ORDER BY uf.date DESC
    `;
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return [];
  }
}
