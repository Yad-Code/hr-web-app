import { NextResponse } from "next/server";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export async function GET(request: Request) { 
  const authHeader = request.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await db`
      INSERT INTO attendance (user_id, date, status, work_hours)
      SELECT 
          u.id, 
          CURRENT_DATE, 
          'Absent', 
          '0h 0m'
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE
      LEFT JOIN leave_requests lr 
        ON u.id = lr.user_id 
        AND lr.status = 'Approved' 
        AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
      WHERE u.status = 'Active'
        AND EXTRACT(DOW FROM CURRENT_DATE)::int = ANY(COALESCE(u.working_days, '{1,2,3,4,5}'::int[]))
        AND a.id IS NULL 
        AND lr.id IS NULL
      RETURNING user_id;
    `;

    return NextResponse.json({
      success: true,
      message: `Successfully marked ${result.length} employees as Absent.`,
    });
  } catch (error) {
    console.error("Cron Job Failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reconcile daily attendance." },
      { status: 500 },
    );
  }
}
