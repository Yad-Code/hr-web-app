// 1. Mock Departments
export const Departments = [
  {
    id: "dept-eng-100",
    name: "Engineering",
    managerId: "user-mgr-alice",
  },
  {
    id: "dept-hr-200",
    name: "People Operations",
    managerId: "user-mgr-bob",
  },
];

// 2. Mock Users
export const Users = [
  {
    id: "user-admin-root",
    email: "admin@company.com",
    passwordHash: "$2b$10$encryptedpasswordhashhere...",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: new Date("2026-01-01T08:00:00Z"),
    updatedAt: new Date("2026-01-01T08:00:00Z"),
  },
  {
    id: "user-mgr-alice",
    email: "alice.manager@company.com",
    passwordHash: "$2b$10$encryptedpasswordhashhere...",
    role: "MANAGER",
    status: "ACTIVE",
    createdAt: new Date("2026-01-15T09:00:00Z"),
    updatedAt: new Date("2026-01-15T09:00:00Z"),
  },
  {
    id: "user-mgr-bob",
    email: "bob.hr@company.com",
    passwordHash: "$2b$10$encryptedpasswordhashhere...",
    role: "MANAGER",
    status: "ACTIVE",
    createdAt: new Date("2026-01-20T09:00:00Z"),
    updatedAt: new Date("2026-01-20T09:00:00Z"),
  },
  {
    id: "user-emp-yad",
    email: "yad.dev@company.com",
    passwordHash: "$2b$10$encryptedpasswordhashhere...",
    role: "EMPLOYEE",
    status: "ACTIVE",
    createdAt: new Date("2026-02-10T10:30:00Z"),
    updatedAt: new Date("2026-02-10T10:30:00Z"),
  },
  {
    id: "user-emp-pending",
    email: "newhire.john@example.com",
    passwordHash: "$2b$10$encryptedpasswordhashhere...",
    role: "EMPLOYEE",
    status: "PENDING_APPROVAL",
    createdAt: new Date("2026-07-15T14:15:00Z"),
    updatedAt: new Date("2026-07-15T14:15:00Z"),
  },
];

// 3. Mock Employee Profiles
export const EmployeeProfiles = [
  {
    id: "prof-alice",
    userId: "user-mgr-alice",
    firstName: "Alice",
    lastName: "Smith",
    preferredName: "Alice",
    phoneNumber: "+15550192",
    workType: "FULL_TIME",
    departmentId: "dept-eng-100",
    jobTitle: "Engineering Director",
    hireDate: new Date("2026-01-15T09:00:00Z"),
  },
  {
    id: "prof-bob",
    userId: "user-mgr-bob",
    firstName: "Robert",
    middleName: "John",
    lastName: "Davis",
    preferredName: "Bob",
    phoneNumber: "+15550143",
    workType: "FULL_TIME",
    departmentId: "dept-hr-200",
    jobTitle: "HR Lead",
    hireDate: new Date("2026-01-20T09:00:00Z"),
  },
  {
    id: "prof-yad",
    userId: "user-emp-yad",
    firstName: "Yad",
    lastName: "Developer",
    preferredName: "Yad",
    phoneNumber: "+15550187",
    workType: "FULL_TIME",
    departmentId: "dept-eng-100",
    jobTitle: "Frontend Engineer",
    hireDate: new Date("2026-02-10T10:30:00Z"),
  },
  {
    id: "prof-pending",
    userId: "user-emp-pending",
    firstName: "John",
    middleName: "William",
    lastName: "Doe",
    preferredName: "Johnny",
    phoneNumber: "+15550299",
    workType: "PART_TIME",
    departmentId: "dept-eng-100",
    jobTitle: "Junior Developer",
    hireDate: null, // Still pending, so no official hire date yet
  },
];

// Add this at the bottom of your placeholder-data.ts file:

export const Timesheets = [
  {
    id: 'time-row-1',
    employeeId: 'user-emp-yad',
    date: new Date('2026-07-15T00:00:00Z'),
    clockIn: new Date('2026-07-15T09:00:00Z'),
    clockOut: new Date('2026-07-15T17:00:00Z'),
    breakDurationMinutes: 60,
    status: 'APPROVED',
    notes: 'Worked on Next.js setup.',
  },
  {
    id: 'time-row-2',
    employeeId: 'user-mgr-alice',
    date: new Date('2026-07-15T00:00:00Z'),
    clockIn: new Date('2026-07-15T08:30:00Z'),
    clockOut: new Date('2026-07-15T16:30:00Z'),
    breakDurationMinutes: 45,
    status: 'APPROVED',
    notes: 'Conducted interviews and code reviews.',
  },
  {
    id: 'time-row-3',
    employeeId: 'user-mgr-bob',
    date: new Date('2026-07-15T00:00:00Z'),
    clockIn: new Date('2026-07-15T09:15:00Z'),
    clockOut: new Date('2026-07-15T17:15:00Z'),
    breakDurationMinutes: 60,
    status: 'APPROVED',
    notes: 'Processed payroll and sorted pending approvals.',
  },
  {
    id: 'time-row-4',
    employeeId: 'user-emp-yad',
    date: new Date('2026-07-16T00:00:00Z'),
    clockIn: new Date('2026-07-16T09:00:00Z'),
    clockOut: null,
    breakDurationMinutes: 0,
    status: 'PENDING_APPROVAL',
    notes: 'Building definitions.ts and mock data.',
  }
];