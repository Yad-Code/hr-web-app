import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { MeetingRow } from "@/app/(admin)/dashboard/(overview)/performance/types";
import { SelfAssessment } from "@/app/lib/employeeDashboard/performance/definitions";

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

export async function getAllAdminMeetings(): Promise<MeetingRow[]> {
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
      ORDER BY m.meeting_date DESC
    `;

    return rows;
  } catch (error) {
    console.error("Failed to fetch all admin meetings:", error);
    return [];
  }
}

export async function getMeetingDetailsById(
  id: string,
): Promise<AdminMeetingDetail | null> {
  try {
    const rows = await sql<AdminMeetingDetail[]>`
      SELECT 
        m.id,
        m.employee_id,
        m.manager_id,
        m.meeting_date,
        m.topic,
        m.notes,
        m.action_items,
        m.status,
        m.created_at,
        emp.name AS employee_name,
        emp.email AS employee_email,
        COALESCE(emp.department, 'General') AS department,
        mgr.name AS manager_name
      FROM one_on_one_meetings m
      JOIN users emp ON m.employee_id = emp.id
      LEFT JOIN users mgr ON m.manager_id = mgr.id
      WHERE m.id = ${id}
    `;

    return rows[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch meeting details:", error);
    return null;
  }
}

export async function getEmployeesList(): Promise<EmployeeOption[]> {
  try {
    const rows = await sql<EmployeeOption[]>`
      SELECT 
        id, 
        name, 
        COALESCE(department, 'General') AS department 
      FROM users 
      ORDER BY name ASC
    `;
    return rows;
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
    const data = await sql<SelfAssessment[]>`
      SELECT * FROM self_assessments
      WHERE user_id = ${employeeId} AND cycle = ${cycle}
      LIMIT 1
    `;

    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Failed to fetch employee self-assessment:", error);
    return null;
  }
}
