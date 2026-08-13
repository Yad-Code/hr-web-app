import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { MeetingRow } from "@/app/(admin)/dashboard/(overview)/performance/types";

export async function getAdminUpcomingSyncs(): Promise<MeetingRow[]> {
  try {
    const rows = await sql<MeetingRow[]>`
      SELECT 
        m.id,
        m.meeting_date,
        m.topic,
        m.status,
        u.name AS employee_name,
        COALESCE(u.department, 'General') AS department
      FROM one_on_one_meetings m
      JOIN users u ON m.employee_id = u.id
      WHERE m.meeting_date >= CURRENT_DATE
      ORDER BY m.meeting_date ASC
      LIMIT 5
    `;

    return rows;
  } catch (error) {
    console.error("Failed to fetch admin upcoming syncs:", error);
    return [];
  }
}
