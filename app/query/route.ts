import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// This function queries the database for pending registrations
async function listPendingApprovals() {
  const data = await sql`
    SELECT 
      profiles.first_name,
      profiles.last_name,
      profiles.work_type,
      profiles.job_title,
      users.email,
      departments.name AS department_name
    FROM profiles
    JOIN users ON profiles.user_id = users.id
    JOIN departments ON profiles.department_id = departments.id
    WHERE users.status = 'PENDING_APPROVAL';
  `;

  return data;
}

export async function GET() {
  try {
    const approvals = await listPendingApprovals();
    return Response.json(approvals);
  } catch (error) {
    console.error("Database query failed:", error);
    return Response.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}