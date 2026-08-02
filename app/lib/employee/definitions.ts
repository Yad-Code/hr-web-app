// @/app/lib/employee/definitions.ts

// ==========================================
// 1. ENUMS & ENUM-LIKE TYPES
// ==========================================

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type WorkType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";

// Education levels for the education history tab
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

export interface ProfileTabsProps extends EducationTabProps {
  profile: FullEmployeeProfile;
  userEmail: string;
}

export interface EmploymentHistoryItem {
  title: string;
  period: string;
}

export interface FullEmployeeProfile {
  id: string;
  userId: string;
  employee_id: string;
  name: string; //
  preferred_name?: string | null;
  department?: string | null;
  branch?: string | null;
  date_of_birth?: string | Date | null;
  age?: number | null;
  gender?: string | null;
  nationality?: string | null;
  marital_status?: string | null;
  blood_group?: string | null;
  email: string; //
  personal_email?: string | null;
  personal_phone?: string | null;
  current_address?: string | null;
  role?: string | null;
  jobTitle?: string | null;
  status?: string | null;
  base_salary?: number | null;
  image_url?: string | null;
  shift_start?: string | null;
  shift_end?: string | null;
  shift_type?: string | null;

  // Optional extended job fields for JobInformationTab
  jobFamily?: string | null;
  employmentType?: string | null;
  managerName?: string | null;
  joinDate?: string | null;
  privateOrg?: string | null;
  publicOrg?: string | null;
  insurance?: string | null;
  subscription?: string | null;
  history?: EmploymentHistoryItem[];
}

export interface ProfileTabsProps {
  profile: FullEmployeeProfile;
  userEmail: string;
}

export type ProfileTabType = "job" | "official" | "edit";

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

// ==========================================
// 2. CORE DATABASE ENTITIES
// ==========================================

export type User = {
  id: string; // Unique identifier
  email: string; // Used for logging in
  passwordHash: string; // Securely stored password
  role: UserRole;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployeeProfile = {
  id: string;
  userId: string; // Links directly to User.id

  // Name Fields
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;

  // Contact & Personal Details
  phoneNumber?: string;
  personalEmail?: string;
  maritalStatus?: MaritalStatus;
  bloodGroup?: BloodGroup;
  currentAddress?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;

  // Work & Department Info
  employeeId?: string; // Custom string ID (e.g. "EMP-102")
  workType: WorkType;
  departmentId: string;
  jobTitle: string;
  branch?: string;
  hireDate?: Date;
};

export type Department = {
  id: string;
  name: string; // e.g., "Engineering", "Marketing"
  managerId: string; // Links to User.id
};

export type Shift = {
  id: string;
  employeeId: string; // Links to User.id
  startTime: Date;
  endTime: Date;
  notes?: string;
};

export type Timesheet = {
  id: string;
  employeeId: string; // Links to User.id
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  breakDurationMinutes: number;
  status: TimesheetStatus;
  notes?: string;
};

// ==========================================
// 3. UI & COMPONENT-LEVEL TYPES
// ==========================================

// Form state typing for React Server Actions (e.g., useActionState)
export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

// What the user actually submits on the Register Form
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

// ==========================================
// 4. MOCK DATA
// ==========================================

export const Timesheets: Timesheet[] = [
  // --- YAD'S TIMESHEETS ---
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

  // --- ALICE'S TIMESHEETS (Manager) ---
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

  // --- BOB'S TIMESHEETS (HR Manager) ---
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

  // --- ANOTHER DAY FOR YAD ---
  {
    id: "time-row-4",
    employeeId: "user-emp-yad",
    date: new Date("2026-07-16T00:00:00Z"),
    clockIn: new Date("2026-07-16T09:00:00Z"),
    clockOut: null, // Currently clocked in today!
    breakDurationMinutes: 0,
    status: "PENDING_APPROVAL",
    notes: "Building definitions.ts and mock data.",
  },
];
