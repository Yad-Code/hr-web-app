export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type WorkType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";

export type AccountStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "TERMINATED";

export type User = {
  id: string; // Unique identifier (typically a UUID or MongoDB ObjectId)
  email: string; // Used for logging in
  passwordHash: string; // Securely stored password (never expose this to the client!)
  role: UserRole; // ADMIN, MANAGER, or EMPLOYEE
  status: AccountStatus; // PENDING_APPROVAL, ACTIVE, etc.
  createdAt: Date;
  updatedAt: Date;
};

export type EmployeeProfile = {
  id: string;
  userId: string; // Links directly to the User.id (One-to-One relationship)

  // Name Fields (As per your registration plan)
  firstName: string;
  middleName?: string; // Optional field (not everyone has a middle name)
  lastName: string;
  preferredName?: string; // Optional field

  // Contact Details
  phoneNumber?: string; // Optional (good to make optional during registration to lower friction)
  personalEmail?: string; // Optional, if different from their work/login email

  // Work & Department Info
  workType: WorkType; // Full-time, Part-time, etc.
  departmentId: string; // Links to the Department.id
  jobTitle: string; // e.g., "Frontend Developer"
  hireDate?: Date;
};

export type Department = {
  id: string;
  name: string; // e.g., "Engineering", "Marketing"
  managerId: string; // Links to User.id (The manager who approves sign-ups)
};

export type Shift = {
  id: string;
  employeeId: string; // Links to User.id
  startTime: Date;
  endTime: Date;
  notes?: string; // e.g., "On-call support"
};

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
  departmentId: string; // The user selects their department/team
};

export const Timesheets = [
  // --- YAD'S TIMESHEETS ---
  {
    id: "time-row-1",
    employeeId: "user-emp-yad", // Belongs to Yad
    date: new Date("2026-07-15T00:00:00Z"),
    clockIn: new Date("2026-07-15T09:00:00Z"),
    clockOut: new Date("2026-07-15T17:00:00Z"),
    breakDurationMinutes: 60,
    status: "APPROVED",
    notes: "Worked on Next.js setup.",
  },

  // --- ALICE'S TIMESHEETS (Manager, but still clocks in) ---
  {
    id: "time-row-2",
    employeeId: "user-mgr-alice", // Belongs to Alice
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
    employeeId: "user-mgr-bob", // Belongs to Bob
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
    employeeId: "user-emp-yad", // Belongs to Yad again!
    date: new Date("2026-07-16T00:00:00Z"),
    clockIn: new Date("2026-07-16T09:00:00Z"),
    clockOut: null, // Currently clocked in today!
    breakDurationMinutes: 0,
    status: "PENDING_APPROVAL",
    notes: "Building definitions.ts and mock data.",
  },
];
