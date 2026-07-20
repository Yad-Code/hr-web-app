// app/lib/data.ts
import { sql } from "@/app/lib/db"; // Using our configured singleton instance
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/auth";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  image_url: string | null;
  status: "active" | "offline";
  last_seen_text: string;
}

export interface PendingRequest {
  id: string;
  employee_name: string;
  image_url: string | null;
  type: "time-off" | "expense";
  description: string;
  created_at: Date;
}

// 1. FIXED: Profile data fetcher
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
      userId: user.user_id || user.id, // <-- Add this line
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
      SELECT id, name, email, role, image_url, last_seen_at
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
        r.description,
        r.status,
        r.created_at,
        u.name as employee_name,
        u.image_url as employee_image
      FROM requests r
      JOIN users u ON r.employee_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `;
    return data;
  } catch (error) {
    console.error("Database Error fetching pending requests:", error);
    return [];
  }
}

// 5. BONUS: Parallel Dashboard Data Fetcher using Promise.all()
export async function fetchDashboardData() {
  try {
    // Runs independent DB queries in parallel instead of sequentially waiting
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
