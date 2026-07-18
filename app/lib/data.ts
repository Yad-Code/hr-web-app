//The functions till now
//1- fetchEmployeeStatusList
//2- getRelativeTimeString
//3- getCurrentUserRole
//4- fetchPendingAdminRequests
// DON'T FORGET TO ADD Promise.all().
// what is the Promise((resolve) => setTimeout(resolve, 3000));

import { sql } from "@/app/lib/db"; // Using our configured singleton instance
import { formatDistanceToNow } from "date-fns";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  image_url: string | null;
  status: 'active' | 'offline';
  last_seen_text: string;
}

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
      // Guard against null timestamps safely
      const lastSeen = row.last_seen_at ? new Date(row.last_seen_at) : new Date();
      const isActiveNow = NOW.getTime() - lastSeen.getTime() < FIVE_MINUTES_IN_MS;

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
    return []; // Return an empty array as a safe fallback for the UI layout shell
  }
}

function getRelativeTimeString(date: Date): string {
  const ms = new Date().getTime() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Add this helper to your existing lib/data.ts file
export async function getCurrentUserRole(): Promise<"admin" | "employee"> {
  try {
    // Replace this with your actual Auth session verification (e.g., NextAuth, Lucide, or standard JWT cookies)
    // For now, we fetch the first user to establish a stable default fallback
    const rows = await sql`SELECT role FROM users LIMIT 1`;
    return rows[0]?.role || "employee";
  } catch (error) {
    console.error("Error fetching session role:", error);
    return "employee";
  }
}

// Add this to your existing lib/data.ts file
export interface PendingRequest {
  id: string;
  employee_name: string;
  image_url: string | null;
  type: 'time-off' | 'expense';
  description: string;
  created_at: Date;
}

export async function fetchPendingAdminRequests(): Promise<PendingRequest[]> {
  try {
    const rows = await sql`
      SELECT 
        r.id, 
        r.type, 
        r.description, 
        r.created_at,
        u.name as employee_name, 
        u.image_url
      FROM requests r
      JOIN users u ON r.employee_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at ASC
      LIMIT 5
    `;

    return rows.map((row) => ({
      id: row.id,
      employee_name: row.employee_name,
      image_url: row.image_url,
      type: row.type as 'time-off' | 'expense',
      description: row.description,
      created_at: new Date(row.created_at),
    }));
  } catch (error) {
    console.error("Database Error fetching requests:", error);
    return []; // Return empty array on failure so UI doesn't crash
  }
}