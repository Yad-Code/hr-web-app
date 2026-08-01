// app/lib/data.ts
import { sql } from "@/app/lib/employeeDashboard/employee/db"; // Using our configured singleton instance
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/auth";
import { Employee } from "@/app/lib/employeeList/definitions";

export interface PendingRequest {
  id: string;
  employee_name: string;
  image_url: string | null;
  type: "time-off" | "expense";
  description: string;
  created_at: Date;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: string | null;
  status: string;
  work_location?: string;
}

// 1. Profile data fetcher
export async function getProfileData(email: string) {
  try {
    const users = await sql`
      SELECT * 
      FROM users 
      WHERE email = ${email}
    `;

    if (!users[0]) return null;

    const user = users[0];

    return {
      id: user.id,
      userId: user.user_id || user.id,
      employee_id: user.employee_id || user.id.slice(0, 8),
      name: user.name,
      preferred_name: user.preferred_name || user.name,
      department: user.department || "General",
      branch: user.branch || "Main Branch",
      date_of_birth: user.date_of_birth || null,
      age: user.age || null,
      gender: user.gender || "N/A",
      nationality: user.nationality || "N/A",
      marital_status: user.marital_status || "Single",
      blood_group: user.blood_group || "Unknown",
      email: user.email,
      personal_email: user.personal_email || user.email,
      personal_phone: user.personal_phone || "",
      current_address: user.current_address || "",
      role: user.role || "employee",
      status: user.status || "Active",
      image_url: user.image_url || null,
    };
  } catch (error) {
    console.error("Failed to fetch employee profile:", error);
    return null;
  }
}

// 2. Fetch employee status list
export async function fetchEmployeeStatusList(): Promise<Employee[]> {
  try {
    const rows = await sql`
      SELECT id, name, email, role, image_url, last_seen_at, department
      FROM users
      ORDER BY name ASC
    `;

    const NOW = new Date();
    const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

    return rows.map((row) => {
      const lastSeen = row.last_seen_at
        ? new Date(row.last_seen_at)
        : new Date();
      const isActiveNow =
        NOW.getTime() - lastSeen.getTime() < FIVE_MINUTES_IN_MS;

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        image_url: row.image_url,
        department: row.department || "General", // 👈 Added department mapping
        status: isActiveNow ? "active" : "offline",
        last_seen_text: isActiveNow
          ? "Active now"
          : `Active ${formatDistanceToNow(lastSeen, { addSuffix: true })}`,
      };
    });
  } catch (error) {
    console.error("Database Error fetching employee status list:", error);
    return [];
  }
}

// Helper: Relative time string
export function getRelativeTimeString(date: Date): string {
  const ms = new Date().getTime() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// 3. Get current user role
export async function getCurrentUserRole() {
  const session = await auth();
  return session?.user?.role || "employee";
}

// 4. Fetch pending admin requests
export async function fetchPendingAdminRequests() {
  try {
    const data = await sql`
      SELECT 
        r.id,
        r.type,
        CASE 
          WHEN r.type = 'dayoff' THEN 
            CONCAT(UPPER(LEFT(COALESCE(r.leave_category, 'annual'), 1)), SUBSTRING(COALESCE(r.leave_category, 'annual'), 2), ' Leave (', r.total_days, ' ', CASE WHEN r.total_days = 1 THEN 'day' ELSE 'days' END, ') - ', r.reason)
          WHEN r.type = 'timeoff' THEN 
            CONCAT('Hourly Time-Off (', r.hours, ' hrs) - ', r.reason)
          WHEN r.type = 'wfh' THEN 
            CONCAT('Work From Home - ', r.reason)
          WHEN r.type = 'exchange' THEN 
            CONCAT('Shift Exchange - ', r.reason)
          ELSE r.reason
        END AS description,
        r.status,
        r.created_at,
        u.name AS employee_name,
        u.image_url AS employee_image
      FROM leave_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.status ILIKE 'pending'
      ORDER BY r.created_at DESC
    `;
    return data;
  } catch (error) {
    console.error("Database Error fetching pending requests:", error);
    return [];
  }
}

// 5. Parallel Dashboard Data Fetcher
export async function fetchDashboardData() {
  try {
    const [statusList, pendingRequests, userRole] = await Promise.all([
      fetchEmployeeStatusList(),
      fetchPendingAdminRequests(),
      getCurrentUserRole(),
    ]);

    return { statusList, pendingRequests, userRole };
  } catch (error) {
    console.error("Database Error in fetchDashboardData:", error);
    throw new Error("Failed to load dashboard data.");
  }
}

// Helper: Normalize time strings to avoid Unicode space issues (\u202f)
export function getFormattedTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // 12-hour format
  const formattedHours = String(hours).padStart(2, "0");

  return `${formattedHours}:${minutes} ${ampm}`;
}

// Helper: Safely calculate shift duration
export function calculateWorkHours(checkIn: string, checkOut: string): string {
  const parseMins = (timeStr: string) => {
    const cleanStr = timeStr.replace(/\u202f/g, " ").trim();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return h * 60 + m;
  };

  const startMins = parseMins(checkIn);
  const endMins = parseMins(checkOut);
  let diff = endMins - startMins;

  if (diff < 0) diff += 24 * 60; // Overnight shift safety

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
}

// Fetch today's attendance record
export async function getTodayAttendance(
  userId: string,
  date: string,
): Promise<AttendanceRecord | null> {
  try {
    const records = await sql<AttendanceRecord[]>`
      SELECT id, user_id, date::text, check_in, check_out, work_hours, status, work_location
      FROM attendance 
      WHERE user_id = ${userId}::uuid 
        AND date = ${date}::date
      LIMIT 1
    `;
    return records[0] || null;
  } catch (error) {
    console.error("Database Error [getTodayAttendance]:", error);
    throw error;
  }
}

// Record Check-In with optional location parameter (defaults to 'Office')
export async function createCheckIn(
  userId: string,
  date: string,
  checkInTime: string,
  location: "Office" | "Remote" = "Office",
) {
  try {
    await sql`
      INSERT INTO attendance (user_id, date, check_in, status, work_location)
      VALUES (${userId}::uuid, ${date}::date, ${checkInTime}, 'Present', ${location})
    `;
  } catch (error) {
    console.error("Database Error [createCheckIn]:", error);
    throw error;
  }
}

// Record Check-Out
export async function updateCheckOut(
  id: string,
  checkOutTime: string,
  workHours: string,
) {
  try {
    await sql`
      UPDATE attendance 
      SET check_out = ${checkOutTime},
          work_hours = ${workHours}
      WHERE id = ${id}::uuid
    `;
  } catch (error) {
    console.error("Database Error [updateCheckOut]:", error);
    throw error;
  }
}
