export interface AttendanceKpiData {
  presentToday: number;
  lateToday: number;
  absentToday: number;
  onLeaveToday: number;
  totalEmployees: number;
}

export interface DailyAttendanceRow {
  id: string;
  employeeName: string;
  department: string;
  imageUrl: string | null;
  status: "Present" | "Late" | "Absent" | "On Leave";
  checkInTime: string | null;
  checkOutTime: string | null;
  workHours: string | null;
}

export interface LeaveRequestRow {
  id: string;
  employeeName: string;
  imageUrl: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "Pending";
}