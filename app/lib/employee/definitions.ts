// @/app/lib/employee/definitions.ts

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type WorkType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
 
export interface LanguageItem {
  id: string;
  user_id: string;
  language: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
  created_by: string;
  document_url?: string | null;
  created_at?: string;
}

export interface LanguageTabProps {
  languageHistory: LanguageItem[];
  userId?: string;
  employeeId?: string;
  employeeName?: string;
}

export interface EducationItem {
  id: string;
  level: string;
  subject: string;
  institution: string;
  location: string | null;
  score: string | null;
  start_year: number | null;
  end_year: number | null;
  document_url: string | null;
}

export interface EducationTabProps {
  educationHistory: EducationItem[];
}

export interface ProfileTabsProps {
  profile: FullEmployeeProfile;
  userEmail: string;
  educationHistory?: EducationItem[];
  languageHistory?: LanguageItem[];
  documents?: EmployeeDocument[];
}

export interface EmploymentHistoryItem {
  id?: string;
  title: string;
  company: string;
  period: string;
}

export interface EmployeeDocument {
  id: string;
  user_id: string;
  title: string;
  category: "Contract" | "Identification" | "Tax" | "Certification" | "Other";
  file_url: string;
  file_size?: string;
  uploaded_at: string;
}

export interface FullEmployeeProfile {
  id: string;
  userId?: string;
  employee_id?: string | null;
  name: string;
  preferred_name?: string | null;
  email: string;
  personal_email?: string | null;
  personal_phone?: string | null;
  current_address?: string | null;
  date_of_birth?: string | Date | null;
  age?: number | null;
  gender?: string | null;
  nationality?: string | null;
  marital_status?: string | null;
  blood_group?: string | null;
  department?: string | null;
  branch?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  isManager?: boolean;
  hasEmployeeView?: boolean;
  canEditProfile?: boolean;
  canStartReviews?: boolean;
  canLogFeedback?: boolean;
  canApproveLeaves?: boolean;
  status?: string | null;
  base_salary?: number | null;
  image_url?: string | null;
  jobTitle?: string | null;
  jobFamily?: string | null;
  employmentType?: string | null;
  managerName?: string | null;
  joinDate?: string | null;
  shift_start?: string | null;
  shift_end?: string | null;
  shift_type?: string | null;
  privateOrg?: string | null;
  publicOrg?: string | null;
  insurance?: string | null;
  subscription?: string | null;
  history?: EmploymentHistoryItem[];
}

export type ProfileTabType =
  | "job"
  | "personal"
  | "education"
  | "language"
  | "documents";

export type AccountStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "TERMINATED";

export type TimesheetStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | "Unknown";

export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployeeProfile = {
  id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  phoneNumber?: string;
  personalEmail?: string;
  maritalStatus?: MaritalStatus;
  bloodGroup?: BloodGroup;
  currentAddress?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  employeeId?: string;
  workType: WorkType;
  departmentId: string;
  jobTitle: string;
  branch?: string;
  hireDate?: Date;
};

export type Department = {
  id: string;
  name: string;
  managerId: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
};

export type Timesheet = {
  id: string;
  employeeId: string;
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  breakDurationMinutes: number;
  status: TimesheetStatus;
  notes?: string;
};

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export type RegisterFormInput = {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  phoneNumber?: string;
  workType: WorkType;
  departmentId: string;
};

//MOCK DATA!!!!!!!!!!!!!!!!!!!!!!!
export const Timesheets: Timesheet[] = [
  {
    id: "time-row-1",
    employeeId: "user-emp-yad",
    date: new Date("2026-07-15T00:00:00Z"),
    clockIn: new Date("2026-07-15T09:00:00Z"),
    clockOut: new Date("2026-07-15T17:00:00Z"),
    breakDurationMinutes: 60,
    status: "APPROVED",
    notes: "Worked on Next.js setup.",
  },

  {
    id: "time-row-2",
    employeeId: "user-mgr-alice",
    date: new Date("2026-07-15T00:00:00Z"),
    clockIn: new Date("2026-07-15T08:30:00Z"),
    clockOut: new Date("2026-07-15T16:30:00Z"),
    breakDurationMinutes: 45,
    status: "APPROVED",
    notes: "Conducted interviews and code reviews.",
  },

  {
    id: "time-row-3",
    employeeId: "user-mgr-bob",
    date: new Date("2026-07-15T00:00:00Z"),
    clockIn: new Date("2026-07-15T09:15:00Z"),
    clockOut: new Date("2026-07-15T17:15:00Z"),
    breakDurationMinutes: 60,
    status: "APPROVED",
    notes: "Processed payroll and sorted pending approvals.",
  },

  {
    id: "time-row-4",
    employeeId: "user-emp-yad",
    date: new Date("2026-07-16T00:00:00Z"),
    clockIn: new Date("2026-07-16T09:00:00Z"),
    clockOut: null,
    breakDurationMinutes: 0,
    status: "PENDING_APPROVAL",
    notes: "Building definitions.ts and mock data.",
  },
];
