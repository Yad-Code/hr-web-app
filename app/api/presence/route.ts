// @/app/api/presence/route.ts
import { NextResponse } from "next/server";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
 
    await db`
      UPDATE users 
      SET status = 'Active', last_seen_at = CURRENT_TIMESTAMP 
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRESENCE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
