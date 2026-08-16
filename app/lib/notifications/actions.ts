// @/app/lib/notifications/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
 
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "review" | "feedback" | "profile" | "request" | "document";
  read: boolean;
  created_at: string;
}
 
interface DbNotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: Date | string;
}
 
export async function getEmployeeNotifications(
  userId: string,
): Promise<Notification[]> {
  try { 
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
