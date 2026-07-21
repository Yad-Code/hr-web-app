import { NextResponse } from "next/server";
import { sql as db } from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // 1. Extensions & Clean Slate
    await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await db`DROP TABLE IF EXISTS wfh_requests`;
    await db`DROP TABLE IF EXISTS leave_balances`;
    await db`DROP TABLE IF EXISTS attendance`;
    await db`DROP TABLE IF EXISTS requests`;
    await db`DROP TABLE IF EXISTS schedules`;
    await db`DROP TABLE IF EXISTS users`;
    await db`DROP TYPE IF EXISTS user_role`;

    // 2. Create Types & Tables
    await db`CREATE TYPE user_role AS ENUM ('admin', 'employee')`;

    await db`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(50) UNIQUE,
        name VARCHAR(100) NOT NULL,
        preferred_name VARCHAR(100),
        department VARCHAR(100), 
        branch VARCHAR(100),
        date_of_birth DATE,
        age INT,
        gender VARCHAR(20),
        nationality VARCHAR(50),
        marital_status VARCHAR(20) DEFAULT 'Single',
        blood_group VARCHAR(10) DEFAULT 'Unknown',
        email VARCHAR(100) UNIQUE NOT NULL,
        personal_email VARCHAR(100),
        personal_phone VARCHAR(50),
        current_address TEXT,
        password_hash TEXT NOT NULL,
        role user_role DEFAULT 'employee' NOT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        image_url TEXT,
        last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    await db`
      CREATE TABLE schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        work_date DATE NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        notes TEXT
      )
    `;

    await db`
      CREATE TABLE requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    await db`
      CREATE TABLE attendance (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        check_in VARCHAR(10),
        check_out VARCHAR(10),
        work_hours VARCHAR(20),
        status VARCHAR(20) DEFAULT 'Present',
        work_location VARCHAR(20) DEFAULT 'Office',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `;

    // Added: WFH Requests Table
    await db`
      CREATE TABLE wfh_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        request_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    // Added: Leave Balances Table
    await db`
      CREATE TABLE leave_balances (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        annual_total INT DEFAULT 20 NOT NULL,
        annual_remaining INT DEFAULT 14 NOT NULL,
        sick_total INT DEFAULT 10 NOT NULL,
        sick_remaining INT DEFAULT 8 NOT NULL
      )
    `;

    // 3. Hash Passwords
    const adminPassword = await bcrypt.hash("AdminPass123", 10);
    const employeePassword = await bcrypt.hash("EmployeePass123", 10);

    // 4. Seed Users
    const seededUsers = await db`
      INSERT INTO users (
        employee_id, name, preferred_name, department, branch, 
        date_of_birth, age, gender, nationality, marital_status, 
        blood_group, email, personal_email, personal_phone, current_address, 
        password_hash, role, status, image_url
      )
      VALUES 
        (
          'EMP-1001', 'Admin Manager', 'Admin', 'Human Resources', 'HQ - Sulaymaniyah',
          '1988-03-15', 38, 'Female', 'Iraqi', 'Married', 'O+',
          'admin@company.com', 'admin.personal@gmail.com', '+964 770 111 2233',
          'Main Street, District 101, Sulaymaniyah', ${adminPassword}, 'admin', 'Active',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        ),
        (
          'EMP-1002', 'Yad Developer', 'Yad', 'Software Engineering', 'HQ - Sulaymaniyah',
          '2002-05-20', 24, 'Male', 'Iraqi', 'Single', 'A+',
          'yad@company.com', 'yad.dev@gmail.com', '+964 770 222 3344',
          'Salim Street, Sulaymaniyah', ${employeePassword}, 'employee', 'Active',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
        ),
        (
          'EMP-1003', 'Lana Amin', 'Lana', 'UI/UX Design', 'HQ - Sulaymaniyah',
          '1997-09-12', 28, 'Female', 'Iraqi', 'Single', 'B+',
          'lana@company.com', 'lana.amin@gmail.com', '+964 770 333 4455',
          'Barty Street, Sulaymaniyah', ${employeePassword}, 'employee', 'Active',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
        ),
        (
          'EMP-1004', 'Diyar Karwan', 'Diyar', 'Backend Infrastructure', 'HQ - Sulaymaniyah',
          '1995-11-04', 30, 'Male', 'Iraqi', 'Married', 'O-',
          'diyar@company.com', 'diyar.karwan@gmail.com', '+964 770 444 5566',
          'Sarchinar Way, Sulaymaniyah', ${employeePassword}, 'employee', 'Active',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        ),
        (
          'EMP-1005', 'Sara Omar', 'Sara', 'Quality Assurance', 'HQ - Sulaymaniyah',
          '1999-01-28', 27, 'Female', 'Iraqi', 'Single', 'AB+',
          'sara@company.com', 'sara.omar@gmail.com', '+964 770 555 6677',
          'Rapakarin Quarter, Sulaymaniyah', ${employeePassword}, 'employee', 'Active',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
        )
      RETURNING id, role, name;
    `;

    // 5. Seed Leave Balances, Schedules, Requests & Attendance
    const employees = seededUsers.filter((user) => user.role === "employee");

    for (const emp of employees) {
      // Seed leave balance record
      await db`
        INSERT INTO leave_balances (user_id, annual_total, annual_remaining, sick_total, sick_remaining)
        VALUES (${emp.id}, 20, 14, 10, 8)
      `;

      if (emp.name === "Yad Developer") {
        await db`
          INSERT INTO schedules (employee_id, work_date, shift_start, shift_end, notes)
          VALUES 
            (${emp.id}, '2026-07-20', '09:00:00', '17:00:00', 'Frontend Sprint Alignment'),
            (${emp.id}, '2026-07-21', '09:00:00', '17:00:00', 'UI Component Refactoring'),
            (${emp.id}, '2026-07-22', '10:00:00', '18:00:00', 'Database Seeding & Setup'),
            (${emp.id}, '2026-07-23', '09:00:00', '17:00:00', 'Core Dashboard Review'),
            (${emp.id}, '2026-07-24', '09:00:00', '16:00:00', 'Weekly Sync & Retro')
        `;

        await db`
          INSERT INTO requests (employee_id, type, description, status)
          VALUES (${emp.id}, 'time-off', 'Requesting 2 days off for a local engineering hackathon event.', 'pending')
        `;

        // Historical attendance entries across July 2026
        await db`
          INSERT INTO attendance (user_id, date, check_in, check_out, work_hours, status, work_location)
          VALUES 
            (${emp.id}, '2026-07-01', '08:50 AM', '05:00 PM', '8h 10m', 'Present', 'Office'),
            (${emp.id}, '2026-07-02', '08:55 AM', '05:02 PM', '8h 07m', 'Present', 'Office'),
            (${emp.id}, '2026-07-03', '09:15 AM', '05:10 PM', '7h 55m', 'Late', 'Office'),
            (${emp.id}, '2026-07-06', '08:48 AM', '05:00 PM', '8h 12m', 'Present', 'Remote'),
            (${emp.id}, '2026-07-07', '08:52 AM', '05:01 PM', '8h 09m', 'Present', 'Office'),
            (${emp.id}, '2026-07-08', '09:05 AM', '05:00 PM', '7h 55m', 'Late', 'Office'),
            (${emp.id}, '2026-07-09', '08:50 AM', '05:00 PM', '8h 10m', 'Present', 'Remote'),
            (${emp.id}, '2026-07-10', '08:59 AM', '04:30 PM', '7h 31m', 'Present', 'Office'),
            (${emp.id}, '2026-07-13', '08:54 AM', '05:05 PM', '8h 11m', 'Present', 'Office'),
            (${emp.id}, '2026-07-14', '08:50 AM', '05:00 PM', '8h 10m', 'Present', 'Office'),
            (${emp.id}, '2026-07-15', '08:45 AM', '05:00 PM', '8h 15m', 'Present', 'Office'),
            (${emp.id}, '2026-07-16', '08:55 AM', '05:02 PM', '8h 07m', 'Present', 'Remote'),
            (${emp.id}, '2026-07-17', '09:00 AM', '04:00 PM', '7h 00m', 'Present', 'Office'),
            (${emp.id}, '2026-07-20', '08:52 AM', '05:05 PM', '8h 13m', 'Present', 'Office'),
            (${emp.id}, '2026-07-21', '09:02 AM', '05:00 PM', '7h 58m', 'Present', 'Remote')
        `;

        await db`
          INSERT INTO wfh_requests (user_id, request_date, reason, status)
          VALUES (${emp.id}, '2026-07-28', 'Working on server optimization and require quiet space.', 'Pending')
        `;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Database schema built and seeded successfully.",
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
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
