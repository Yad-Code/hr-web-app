// ==========================================
// 1. ENUMS & ENUM-LIKE TYPES
// ==========================================

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type WorkType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";

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

/**
 * Joined profile payload expected by components like ProfileHeader,
 * OfficialInfoCard, and ProfileForm.
 */
export type FullEmployeeProfile = {
  id: string;
  userId: string;
  employee_id?: string;
  name: string; // Combined legal name or display name
  preferred_name?: string;
  role: UserRole;
  status: AccountStatus;
  department?: string;
  branch?: string;
  date_of_birth?: string | Date;
  age?: number;
  gender?: string;
  nationality?: string;
  marital_status?: MaritalStatus;
  blood_group?: BloodGroup;
  personal_email?: string;
  email: string; // Login email
  personal_phone?: string;
  current_address?: string;
};

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