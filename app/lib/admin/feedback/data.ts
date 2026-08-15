// @/app/lib/admin/feedback/data.ts
import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { Feedback, OneOnOneMeeting } from "@/app/lib/employeeDashboard/performance/definitions";

export async function getEmployeeFeedback(employeeId: string): Promise<Feedback[]> {
  try {
    const feedback = await sql<Feedback[]>`
      SELECT * FROM user_feedback
      WHERE user_id = ${employeeId}
      ORDER BY date DESC
    `;
    return feedback;
  } catch (error) {
    console.error("Failed to fetch employee feedback:", error);
    return [];
  }
}

export async function getEmployeeMeetings(employeeId: string): Promise<OneOnOneMeeting[]> {
  try {
    const meetings = await sql<OneOnOneMeeting[]>`
      SELECT * FROM one_on_one_meetings
      WHERE user_id = ${employeeId}
      ORDER BY meeting_date DESC
    `;
    return meetings;
  } catch (error) {
    console.error("Failed to fetch employee meetings:", error);
    return [];
  }
}