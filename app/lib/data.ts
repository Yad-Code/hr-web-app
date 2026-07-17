import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

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
    const FIVE_MINUTES_AGO = 5 * 60 * 1000;

    return rows.map((row) => {
      const lastSeen = new Date(row.last_seen_at);
      const isRecent = (NOW.getTime() - lastSeen.getTime()) < FIVE_MINUTES_AGO;
      
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        image_url: row.image_url,
        status: isRecent ? 'active' : 'offline',
        last_seen_text: isRecent ? 'Active now' : `Active ${getRelativeTimeString(lastSeen)}`
      };
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to load employee list.");
  }
}

function getRelativeTimeString(date: Date): string {
  const ms = new Date().getTime() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Add this helper to your existing lib/data.ts file
export async function getCurrentUserRole(): Promise<'admin' | 'employee'> {
  try {
    // Replace this with your actual Auth session verification (e.g., NextAuth, Lucide, or standard JWT cookies)
    // For now, we fetch the first user to establish a stable default fallback
    const rows = await sql`SELECT role FROM users LIMIT 1`;
    return rows[0]?.role || 'employee';
  } catch (error) {
    console.error("Error fetching session role:", error);
    return 'employee';
  }
}