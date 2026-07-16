import bcrypt from "bcrypt";
import postgres from "postgres";
import {
  Users,
  Departments,
  EmployeeProfiles,
  Timesheets,
} from "@/app/lib/placeholder-data"; // Adjust path if your file is located elsewhere

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// 1. Seed Users
async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedUsers = await Promise.all(
    Users.map(async (user) => {
      // Hash the placeholder password safely
      const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
      return sql`
        INSERT INTO users (id, email, password, role, status, created_at, updated_at)
        VALUES (${user.id}, ${user.email}, ${hashedPassword}, ${user.role}, ${user.status}, ${user.createdAt}, ${user.updatedAt})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

// 2. Seed Departments
async function seedDepartments() {
  await sql`
    CREATE TABLE IF NOT EXISTS departments (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      manager_id VARCHAR(255) NOT NULL
    );
  `;

  const insertedDepartments = await Promise.all(
    Departments.map(
      (dept) => sql`
      INSERT INTO departments (id, name, manager_id)
      VALUES (${dept.id}, ${dept.name}, ${dept.managerId})
      ON CONFLICT (id) DO NOTHING;
    `,
    ),
  );

  return insertedDepartments;
}

// 3. Seed Employee Profiles
async function seedProfiles() {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(255) NOT NULL,
      middle_name VARCHAR(255),
      last_name VARCHAR(255) NOT NULL,
      preferred_name VARCHAR(255),
      phone_number VARCHAR(50),
      work_type VARCHAR(50) NOT NULL,
      department_id VARCHAR(255) NOT NULL,
      job_title VARCHAR(255) NOT NULL,
      hire_date TIMESTAMP WITH TIME ZONE
    );
  `;

  const insertedProfiles = await Promise.all(
    EmployeeProfiles.map(
      (prof) => sql`
      INSERT INTO profiles (
        id, user_id, first_name, middle_name, last_name, 
        preferred_name, phone_number, work_type, department_id, job_title, hire_date
      )
      VALUES (
        ${prof.id}, ${prof.userId}, ${prof.firstName}, ${prof.middleName || null}, ${prof.lastName}, 
        ${prof.preferredName || null}, ${prof.phoneNumber || null}, ${prof.workType}, ${prof.departmentId}, ${prof.jobTitle}, ${prof.hireDate}
      )
      ON CONFLICT (id) DO NOTHING;
    `,
    ),
  );

  return insertedProfiles;
}

// 4. Seed Timesheets
async function seedTimesheets() {
  await sql`
    CREATE TABLE IF NOT EXISTS timesheets (
      id VARCHAR(255) PRIMARY KEY,
      employee_id VARCHAR(255) NOT NULL,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      clock_in TIMESTAMP WITH TIME ZONE,
      clock_out TIMESTAMP WITH TIME ZONE,
      break_duration_minutes INT NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL,
      notes TEXT
    );
  `;

  const insertedTimesheets = await Promise.all(
    Timesheets.map(
      (sheet) => sql`
      INSERT INTO timesheets (
        id, employee_id, date, clock_in, clock_out, break_duration_minutes, status, notes
      )
      VALUES (
        ${sheet.id}, ${sheet.employeeId}, ${sheet.date}, ${sheet.clockIn}, ${sheet.clockOut}, ${sheet.breakDurationMinutes}, ${sheet.status}, ${sheet.notes || null}
      )
      ON CONFLICT (id) DO NOTHING;
    `,
    ),
  );

  return insertedTimesheets;
}

// 5. GET Route Handler
export async function GET() {
  try {
    // Run all seeding steps in a safe, single transaction sequence
    await sql.begin((sql) => {
      seedUsers();
      seedDepartments();
      seedProfiles();
      seedTimesheets();
    });

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seeding error:", error);
    return Response.json(
      { error: (error as Error).message || error },
      { status: 500 },
    );
  }
}
