// @/app/lib/definitions/attendance.ts

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
  date: number | null; // e.g. 1, 2, 3... or null for padding
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

export interface AttendanceData {
  today: TodayAttendance;
  summary: AttendanceSummary;
  leaveBalance: LeaveBalance;
  calendarDays: CalendarDay[];
  attendanceLog: AttendanceLog[];
}
