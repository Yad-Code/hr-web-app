// @/app/lib/admin/performance/data.ts

import { sql } from "@/app/lib/employeeDashboard/employee/db";
import { MeetingRow } from "@/app/(admin)/dashboard/(overview)/performance/types";
import { SelfAssessment } from "@/app/lib/employeeDashboard/performance/definitions";
import { auth } from "@/auth"; // 👈 Import auth

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
    const session = await auth();
    if (!session?.user) return [];

    const isAdmin = session.user.role === "admin";
    const managerName = session.user.name as string;

    if (isAdmin) {
      return await sql<MeetingRow[]>`
        SELECT m.id, m.meeting_date, m.topic, m.status, u.name AS employee_name, COALESCE(u.department, 'General') AS department
        FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
        WHERE m.meeting_date >= CURRENT_DATE
        ORDER BY m.meeting_date ASC LIMIT 5
      `;
    } else {
      return await sql<MeetingRow[]>`
        SELECT m.id, m.meeting_date, m.topic, m.status, u.name AS employee_name, COALESCE(u.department, 'General') AS department
        FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
        WHERE m.meeting_date >= CURRENT_DATE AND u.manager_name = ${managerName}
        ORDER BY m.meeting_date ASC LIMIT 5
      `;
    }
  } catch (error) {
    console.error("Failed to fetch admin upcoming syncs:", error);
    return [];
  }
}

export async function getAllAdminMeetings(): Promise<MeetingRow[]> {
  try {
    const session = await auth();
    if (!session?.user) return [];

    const isAdmin = session.user.role === "admin";
    const managerName = session.user.name as string;

    if (isAdmin) {
      return await sql<MeetingRow[]>`
        SELECT m.id, m.meeting_date, m.topic, m.status, u.name AS employee_name, COALESCE(u.department, 'General') AS department
        FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
        ORDER BY m.meeting_date DESC
      `;
    } else {
      return await sql<MeetingRow[]>`
        SELECT m.id, m.meeting_date, m.topic, m.status, u.name AS employee_name, COALESCE(u.department, 'General') AS department
        FROM one_on_one_meetings m JOIN users u ON m.employee_id = u.id
        WHERE u.manager_name = ${managerName}
        ORDER BY m.meeting_date DESC
      `;
    }
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
    if (!session?.user) return null;

    const isAdmin = session.user.role === "admin";
    const managerName = session.user.name as string;

    let rows;
    if (isAdmin) {
      rows = await sql<AdminMeetingDetail[]>`
        SELECT 
          m.id, m.employee_id, m.manager_id, m.meeting_date, m.topic, m.notes, m.action_items, m.status, m.created_at,
          emp.name AS employee_name, emp.email AS employee_email, COALESCE(emp.department, 'General') AS department,
          mgr.name AS manager_name
        FROM one_on_one_meetings m
        JOIN users emp ON m.employee_id = emp.id
        LEFT JOIN users mgr ON m.manager_id = mgr.id
        WHERE m.id = ${id}
      `;
    } else {
      rows = await sql<AdminMeetingDetail[]>`
        SELECT 
          m.id, m.employee_id, m.manager_id, m.meeting_date, m.topic, m.notes, m.action_items, m.status, m.created_at,
          emp.name AS employee_name, emp.email AS employee_email, COALESCE(emp.department, 'General') AS department,
          mgr.name AS manager_name
        FROM one_on_one_meetings m
        JOIN users emp ON m.employee_id = emp.id
        LEFT JOIN users mgr ON m.manager_id = mgr.id
        WHERE m.id = ${id} AND emp.manager_name = ${managerName}
      `;
    }

    return rows[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch meeting details:", error);
    return null;
  }
}

export async function getEmployeesList(): Promise<EmployeeOption[]> {
  try {
    const session = await auth();
    if (!session?.user) return [];

    const isAdmin = session.user.role === "admin";
    const managerName = session.user.name as string;

    if (isAdmin) {
      return await sql<EmployeeOption[]>`
        SELECT id, name, COALESCE(department, 'General') AS department 
        FROM users 
        WHERE status = 'Active'
        ORDER BY name ASC
      `;
    } else {
      return await sql<EmployeeOption[]>`
        SELECT id, name, COALESCE(department, 'General') AS department 
        FROM users 
        WHERE status = 'Active' AND manager_name = ${managerName}
        ORDER BY name ASC
      `;
    }
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
    if (!session?.user) return null;

    const isAdmin = session.user.role === "admin";
    const managerName = session.user.name as string;

    let data;
    if (isAdmin) {
      data = await sql<SelfAssessment[]>`
        SELECT * FROM self_assessments
        WHERE user_id = ${employeeId} AND cycle = ${cycle}
        LIMIT 1
      `;
    } else {
      data = await sql<SelfAssessment[]>`
        SELECT sa.* FROM self_assessments sa
        JOIN users u ON sa.user_id = u.id
        WHERE sa.user_id = ${employeeId} AND sa.cycle = ${cycle} AND u.manager_name = ${managerName}
        LIMIT 1
      `;
    }

    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Failed to fetch employee self-assessment:", error);
    return null;
  }
}
