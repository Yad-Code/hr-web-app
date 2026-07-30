// @/app/lib/notifications/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

// Export the Notification interface for TopNavbar
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "review" | "feedback" | "profile" | "request" | "document";
  read: boolean;
  created_at: string;
}

// Intermediary type for raw database query results
interface DbNotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: Date | string;
}

/**
 * Fetch top recent notifications for an employee from PostgreSQL
 */
export async function getEmployeeNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    // 1. Fetch performance notifications
    const perfNotifs = await db`
      SELECT 
        id,
        user_id,
        title,
        description AS message,
        LOWER(type) AS type,
        is_read AS read,
        created_at
      FROM performance_notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // 2. Fetch unread user feedback as notification items
    const feedbackNotifs = await db`
      SELECT 
        id,
        user_id,
        CONCAT('Feedback from ', sender) AS title,
        text AS message,
        'feedback' AS type,
        is_read AS read,
        created_at
      FROM user_feedback
      WHERE user_id = ${userId} AND is_read = false
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // 3. Strongly typed mapping without 'any'
    const rawRows = [
      ...perfNotifs,
      ...feedbackNotifs,
    ] as unknown as DbNotificationRow[];

    const combined: Notification[] = rawRows.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      message: item.message,
      type: mapTypeToCategory(item.type),
      read: Boolean(item.read),
      created_at: new Date(item.created_at).toISOString(),
    }));

    // Sort by newest first
    combined.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return combined.slice(0, 10);
  } catch (error) {
    console.error("Error fetching employee notifications:", error);
    return [];
  }
}

/**
 * Helper function to map DB types to UI category types
 */
function mapTypeToCategory(type: string): Notification["type"] {
  switch (type?.toLowerCase()) {
    case "assessment":
    case "review":
      return "review";
    case "goal":
    case "request":
      return "request";
    case "feedback":
    case "recognition":
      return "feedback";
    default:
      return "document";
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await db`
      UPDATE performance_notifications 
      SET is_read = true 
      WHERE id = ${notificationId}
    `;

    await db`
      UPDATE user_feedback 
      SET is_read = true 
      WHERE id = ${notificationId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error updating notification read status:", error);
    return { success: false };
  }
}

/**
 * Mark all notifications as read for a given user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db`
      UPDATE performance_notifications 
      SET is_read = true 
      WHERE user_id = ${userId}
    `;

    await db`
      UPDATE user_feedback 
      SET is_read = true 
      WHERE user_id = ${userId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}
