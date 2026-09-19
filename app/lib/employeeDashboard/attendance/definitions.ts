// @/app/lib/employeeDashboard/attendance/definitions.ts

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "On Leave"
  | "Weekend";

export interface TodayAttendance {
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workLocation?: "Office" | "Remote" | string;
  shiftStart?: string;
  shiftEnd?: string;
  shiftType?: string;
}

export interface AttendanceSummary {
  attendanceRate: number;
  daysPresent: number;
  lateArrivals: number;
  totalHoursLogged: number;
}

export interface LeaveBalance {
  annualTotal: number;
  annualRemaining: number;
  sickTotal: number;
  sickRemaining: number;
  monthlyTotalHours: number;
  monthlyRemainingHours: number;
}

export interface CalendarDay {
  date: number | null;
  status?: "present" | "late" | "absent" | "weekend" | string;
  isToday?: boolean;
}

export interface AttendanceLog {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: string | null;
  status: AttendanceStatus | string;
  location: string;
}

export interface PendingExchangeRequest {
  id: string;
  original_date: string | Date;
  exchange_date: string | Date;
  reason: string;
  requester_name: string;
}

export interface AttendanceData {
  today: TodayAttendance;
  summary: AttendanceSummary;
  leaveBalance: LeaveBalance;
  calendarDays: CalendarDay[];
  attendanceLog: AttendanceLog[];
  workingDays: number[];
  currentMonth: string;
  currentYear: number;
  overrides: Array<{ date: string; isWorking: boolean }>;
}
