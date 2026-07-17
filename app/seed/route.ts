import { NextResponse } from "next/server";
import postgres from "postgres";
import bcrypt from "bcrypt";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET() {
  try {
    // 1. Clean slate / Extensions
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Drop in reverse order of foreign keys to avoid conflicts
    await sql`DROP TABLE IF EXISTS schedules`;
    await sql`DROP TABLE IF EXISTS users`;
    await sql`DROP TYPE IF EXISTS user_role`;

    // 2. Create Types & Tables
    await sql`CREATE TYPE user_role AS ENUM ('admin', 'employee')`;

    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role user_role DEFAULT 'employee' NOT NULL,
        image_url TEXT
      )
    `;

    await sql`
      CREATE TABLE schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        work_date DATE NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        notes TEXT
      )
    `;

    // 3. Hash Passwords
    const adminPassword = await bcrypt.hash("AdminPass123", 10);
    const employeePassword = await bcrypt.hash("EmployeePass123", 10);

    // 4. Seed Users (Expanded Team)
    const seededUsers = await sql`
  INSERT INTO users (name, email, password_hash, role, image_url)
  VALUES 
    (
      'Admin Manager', 
      'admin@company.com', 
      ${adminPassword}, 
      'admin', 
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    ),
    (
      'Yad Developer', 
      'yad@company.com', 
      ${employeePassword}, 
      'employee', 
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    ),
    (
      'Lana Amin', 
      'lana@company.com', 
      ${employeePassword}, 
      'employee', 
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    ),
    (
      'Diyar Karwan', 
      'diyar@company.com', 
      ${employeePassword}, 
      'employee', 
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    ),
    (
      'Sara Omar', 
      'sara@company.com', 
      ${employeePassword}, 
      'employee', 
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
    )
  RETURNING id, role, name;
`;

    // 5. Seed Work Schedules for All Regular Employees Dynamically
    const employees = seededUsers.filter((user) => user.role === "employee");

    for (const emp of employees) {
      if (emp.name === "Yad Developer") {
        await sql`
      INSERT INTO schedules (employee_id, work_date, shift_start, shift_end, notes)
      VALUES 
        (${emp.id}, '2026-07-20', '09:00:00', '17:00:00', 'Frontend Sprint Alignment'),
        (${emp.id}, '2026-07-21', '09:00:00', '17:00:00', 'UI Component Refactoring'),
        (${emp.id}, '2026-07-22', '10:00:00', '18:00:00', 'Database Seeding & Setup'),
        (${emp.id}, '2026-07-23', '09:00:00', '17:00:00', 'Core Dashboard Review'),
        (${emp.id}, '2026-07-24', '09:00:00', '16:00:00', 'Weekly Sync & Retro')
    `;
      } else if (emp.name === "Lana Amin") {
        await sql`
      INSERT INTO schedules (employee_id, work_date, shift_start, shift_end, notes)
      VALUES 
        (${emp.id}, '2026-07-20', '08:30:00', '16:30:00', 'UI/UX Design Handover'),
        (${emp.id}, '2026-07-21', '08:30:00', '16:30:00', 'Figma Prototype Revisions'),
        (${emp.id}, '2026-07-22', '08:30:00', '16:30:00', 'User Testing Interviews'),
        (${emp.id}, '2026-07-23', '08:30:00', '16:30:00', 'Design System Audit'),
        (${emp.id}, '2026-07-24', '08:30:00', '15:30:00', 'Weekly Sync & Retro')
    `;
      } else if (emp.name === "Diyar Karwan") {
        await sql`
      INSERT INTO schedules (employee_id, work_date, shift_start, shift_end, notes)
      VALUES 
        (${emp.id}, '2026-07-20', '09:00:00', '17:00:00', 'Backend API Optimization'),
        (${emp.id}, '2026-07-21', '09:00:00', '17:00:00', 'PostgreSQL Query Tuning'),
        (${emp.id}, '2026-07-22', '09:00:00', '17:00:00', 'Auth Security Audit'),
        (${emp.id}, '2026-07-23', '11:00:00', '19:00:00', 'Late Shift - Server Maintenance'),
        (${emp.id}, '2026-07-24', '09:00:00', '16:00:00', 'Weekly Sync & Retro')
    `;
      } else if (emp.name === "Sara Omar") {
        await sql`
      INSERT INTO schedules (employee_id, work_date, shift_start, shift_end, notes)
      VALUES 
        (${emp.id}, '2026-07-20', '09:00:00', '17:00:00', 'QA Automated Test Setup'),
        (${emp.id}, '2026-07-21', '09:00:00', '17:00:00', 'Dashboard Form Validation Tests'),
        (${emp.id}, '2026-07-22', '09:00:00', '17:00:00', 'Regression Testing Session'),
        (${emp.id}, '2026-07-23', '09:00:00', '17:00:00', 'Bug Backlog Triage'),
        (${emp.id}, '2026-07-24', '09:00:00', '16:00:00', 'Weekly Sync & Retro')
    `;
      }
    }
    return NextResponse.json(
      {
        success: true,
        message:
          "Database schema built and populated successfully with profile photos.",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred during database configuration.";
    console.error("Seeding Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
