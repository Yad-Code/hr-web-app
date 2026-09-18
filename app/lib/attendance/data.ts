import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import {
  AttendanceKpiData,
  DailyAttendanceRow,
  LeaveRequestRow,
  ShiftRule,
} from "@/app/(admin)/dashboard/(overview)/attendance/types";

export async function getAttendanceDashboardData(
  targetDate: string,
  actorId: string,
) {
  // Check if the current user has the right to approve leaves (used to show/hide UI buttons)
  const permCheck = await db`
    SELECT 1 FROM user_permissions up
    JOIN permissions p ON p.id = up.permission_id
    WHERE up.user_id = ${actorId}::uuid AND p.action = 'approve_leaves'
    LIMIT 1
  `;
  const canApproveLeaves = permCheck.length > 0;

  // Execute all queries in parallel, filtered dynamically by their assigned ABAC scopes
  const [
    kpiStatsResult,
    rawLogsResult,
    requestRowsResult,
    shiftRowsResult,
    employeesResult,
  ] = await Promise.all([
    db`
      WITH auth_users AS (
        SELECT DISTINCT u.id FROM users u
        JOIN user_permissions up ON up.user_id = ${actorId}::uuid
        JOIN permissions p ON p.id = up.permission_id
        WHERE p.action IN ('view_dashboard', 'approve_leaves')
          AND (
            up.scope = 'global' OR
            (up.scope = 'branch' AND u.branch = up.target_branch) OR
            (up.scope = 'department' AND u.department = up.target_department) OR
            (up.scope = 'team' AND u.manager_id = ${actorId}::uuid) OR
            (up.scope = 'self' AND u.id = ${actorId}::uuid)
          )
      )
      SELECT 
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_today,
        COUNT(CASE WHEN a.status = 'Late' THEN 1 END) as late_today,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_today,
        (
          SELECT COUNT(*) FROM leave_requests lr 
          WHERE lr.status = 'Approved' 
            AND ${targetDate}::date BETWEEN lr.start_date AND lr.end_date
            AND lr.user_id IN (SELECT id FROM auth_users)
        ) as on_leave_today,
        (
          SELECT COUNT(*) FROM users 
          WHERE status = 'Active' AND id IN (SELECT id FROM auth_users)
        ) as total_employees
      FROM attendance a
      WHERE a.date = ${targetDate}::date
        AND a.user_id IN (SELECT id FROM auth_users)
    `,
    db`
      WITH auth_users AS (
        SELECT DISTINCT u.id FROM users u
        JOIN user_permissions up ON up.user_id = ${actorId}::uuid
        JOIN permissions p ON p.id = up.permission_id
        WHERE p.action IN ('view_dashboard', 'approve_leaves')
          AND (
            up.scope = 'global' OR
            (up.scope = 'branch' AND u.branch = up.target_branch) OR
            (up.scope = 'department' AND u.department = up.target_department) OR
            (up.scope = 'team' AND u.manager_id = ${actorId}::uuid) OR
            (up.scope = 'self' AND u.id = ${actorId}::uuid)
          )
      )
      SELECT 
        a.id, u.name as employee_name, u.department, u.image_url, 
        a.status, a.check_in, a.check_out, a.work_hours
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.date = ${targetDate}::date
        AND u.id IN (SELECT id FROM auth_users)
      ORDER BY a.created_at DESC
    `,
    db`
      WITH auth_users AS (
        SELECT DISTINCT u.id FROM users u
        JOIN user_permissions up ON up.user_id = ${actorId}::uuid
        JOIN permissions p ON p.id = up.permission_id
        WHERE p.action IN ('view_dashboard', 'approve_leaves')
          AND (
            up.scope = 'global' OR
            (up.scope = 'branch' AND u.branch = up.target_branch) OR
            (up.scope = 'department' AND u.department = up.target_department) OR
            (up.scope = 'team' AND u.manager_id = ${actorId}::uuid) OR
            (up.scope = 'self' AND u.id = ${actorId}::uuid)
          )
      )
      SELECT 
        r.id, u.name AS employee_name, u.image_url, u.job_title,       
        r.created_at, r.type, r.leave_category, r.start_date, r.end_date,
        r.total_days, r.hours, r.status, r.reason, h.name AS helper_name
      FROM leave_requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users h ON r.helper_id = h.id
      WHERE u.id IN (SELECT id FROM auth_users)
      ORDER BY r.created_at DESC
    `,
    db`
      SELECT id, shift_name, start_time, end_time, grace_period_minutes
      FROM shift_rules ORDER BY created_at ASC
    `,
    db`
      WITH auth_users AS (
        SELECT DISTINCT u.id FROM users u
        JOIN user_permissions up ON up.user_id = ${actorId}::uuid
        JOIN permissions p ON p.id = up.permission_id
        WHERE p.action IN ('view_dashboard', 'approve_leaves')
          AND (
            up.scope = 'global' OR
            (up.scope = 'branch' AND u.branch = up.target_branch) OR
            (up.scope = 'department' AND u.department = up.target_department) OR
            (up.scope = 'team' AND u.manager_id = ${actorId}::uuid) OR
            (up.scope = 'self' AND u.id = ${actorId}::uuid)
          )
      )
      SELECT id, name, department, shift_type 
      FROM users 
      WHERE status = 'Active' AND id IN (SELECT id FROM auth_users)
    `,
  ]);

  const kpis: AttendanceKpiData = {
    presentToday: Number(kpiStatsResult[0]?.present_today || 0),
    lateToday: Number(kpiStatsResult[0]?.late_today || 0),
    absentToday: Number(kpiStatsResult[0]?.absent_today || 0),
    onLeaveToday: Number(kpiStatsResult[0]?.on_leave_today || 0),
    totalEmployees: Number(kpiStatsResult[0]?.total_employees || 0),
  };

  const dailyLogs: DailyAttendanceRow[] = rawLogsResult.map((row) => ({
    id: row.id as string,
    employeeName: row.employee_name as string,
    department: (row.department as string) || "Unassigned",
    imageUrl: row.image_url as string | null,
    status: row.status as DailyAttendanceRow["status"],
    checkInTime: row.check_in as string | null,
    checkOutTime: row.check_out as string | null,
    workHours: row.work_hours as string | null,
  }));

  const leaveRequests: LeaveRequestRow[] = requestRowsResult.map((row) => {
    let formattedType = row.type as string;
    if (formattedType === "timeoff") formattedType = "Hourly Time-Off";
    else if (formattedType === "dayoff")
      formattedType = row.leave_category
        ? `${row.leave_category} Leave`
        : "Day Off";
    else if (formattedType === "wfh") formattedType = "Work From Home";
    else if (formattedType === "exchange") formattedType = "Shift Exchange";

    return {
      id: row.id as string,
      employeeName: row.employee_name as string,
      imageUrl: row.image_url as string | null,
      leaveType: formattedType,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      days: Number(row.total_days),
      hours: Number(row.hours),
      jobTitle: row.job_title as string | null,
      createdAt: row.created_at as Date,
      reason: row.reason as string,
      helperName: row.helper_name as string | null,
      status: ((row.status as string).charAt(0).toUpperCase() +
        (row.status as string).slice(1)) as "Pending" | "Approved" | "Rejected",
    };
  });

  const shifts: ShiftRule[] = shiftRowsResult.map((row) => ({
    id: row.id as string,
    shiftName: row.shift_name as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    gracePeriodMinutes: Number(row.grace_period_minutes),
  }));

  const employeesList = employeesResult.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    department: (row.department as string) || "Unassigned",
    shift_type: (row.shift_type as string) || "Standard",
  }));

  return {
    kpis,
    dailyLogs,
    leaveRequests,
    shifts,
    employeesList,
    canApproveLeaves,
  };
}
