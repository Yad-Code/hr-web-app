import { NextResponse } from "next/server";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // Extensions & Clean Slate
    await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Drop profile tables
    await db`DROP TABLE IF EXISTS employee_languages`;
    await db`DROP TABLE IF EXISTS employee_documents`;

    // Drop new performance tables
    await db`DROP TABLE IF EXISTS performance_history`;
    await db`DROP TABLE IF EXISTS career_development`;
    await db`DROP TABLE IF EXISTS performance_notifications`;
    await db`DROP TABLE IF EXISTS self_assessments`;
    await db`DROP TABLE IF EXISTS one_on_one_meetings`;

    // new tables
    await db`DROP TABLE IF EXISTS user_feedback`;
    await db`DROP TABLE IF EXISTS user_skills`;
    await db`DROP TABLE IF EXISTS skills`;
    await db`DROP TABLE IF EXISTS user_goals`;
    await db`DROP TABLE IF EXISTS user_kpis`;
    await db`DROP TABLE IF EXISTS user_performance`;
    await db`DROP TABLE IF EXISTS performance_reviews`;

    // Drop existing tables
    await db`DROP TABLE IF EXISTS wfh_requests`;
    await db`DROP TABLE IF EXISTS leave_balances`;
    await db`DROP TABLE IF EXISTS attendance`;
    await db`DROP TABLE IF EXISTS requests`;
    await db`DROP TABLE IF EXISTS schedules`;

    await db`DROP TABLE IF EXISTS users CASCADE`;
    await db`DROP TYPE IF EXISTS user_role`;
    await db`DROP TYPE IF EXISTS user_status`;
    await db`DROP TABLE IF EXISTS job_postings`;
    await db`DROP TABLE IF EXISTS payment_methods`;
    await db`DROP TABLE IF EXISTS pay_stub_items`;
    await db`DROP TABLE IF EXISTS pay_stubs`;
    await db`DROP TABLE IF EXISTS schedule_overrides`;

    //ADMIN Time and Attendance tables
    await db`DROP TABLE IF EXISTS leave_requests`;
    await db`DROP TABLE IF EXISTS daily_attendance`;
    await db`DROP TABLE IF EXISTS shift_rules`;
    await db`DROP TABLE IF EXISTS education_history`;
    await db`DROP TABLE IF EXISTS employment_history`;

    // 2. Create Types & Tables
    await db`CREATE TYPE user_role AS ENUM ('admin', 'employee')`;

    // --- Original Tables ---
    await db`
     CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(50) UNIQUE,
        name VARCHAR(100) NOT NULL,
        preferred_name VARCHAR(100),
        job_title VARCHAR(100),
        job_family VARCHAR(100),
        employment_type VARCHAR(50) DEFAULT 'Full-Time',
        manager_name VARCHAR(100),
        join_date DATE,
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
        base_salary DECIMAL(10,2) DEFAULT 3500.00 NOT NULL,
        public_org VARCHAR(100),
        private_org VARCHAR(100),
        insurance VARCHAR(100),
        subscription VARCHAR(100),
        image_url TEXT,
        shift_start TIME DEFAULT '09:00:00' NOT NULL,
        shift_end TIME DEFAULT '17:00:00' NOT NULL,
        shift_type VARCHAR(50) DEFAULT 'Standard' NOT NULL,
        working_days INT[] DEFAULT '{1,2,3,4,5}',  
        last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    await db`
      CREATE TABLE schedule_overrides (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          target_date DATE NOT NULL,
          is_working BOOLEAN NOT NULL, -- True if taking an extra shift, False if giving one away
          notes TEXT,
          UNIQUE(user_id, target_date) -- Prevents duplicate conflicts on the same day
      );
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

    await db`
      CREATE TABLE leave_balances (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        annual_total INT DEFAULT 20 NOT NULL,
        annual_remaining INT DEFAULT 14 NOT NULL,
        sick_total INT DEFAULT 10 NOT NULL,
        sick_remaining INT DEFAULT 8 NOT NULL,
        monthly_total_hours INT DEFAULT 16 NOT NULL,
        monthly_remaining_hours INT DEFAULT 16 NOT NULL
     )
    `;

    // --- New Performance Tables ---
    await db`
      CREATE TABLE user_performance (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        rating NUMERIC(3,1) NOT NULL,
        cycle VARCHAR(50) NOT NULL,
        next_review DATE NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `;

    await db`
      CREATE TABLE user_kpis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        label VARCHAR(100) NOT NULL,
        value VARCHAR(50) NOT NULL,
        target VARCHAR(50) NOT NULL,
        trend VARCHAR(50) NOT NULL,
        is_up BOOLEAN NOT NULL
      )
    `;

    await db`
      CREATE TABLE user_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        progress INTEGER DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
        due_date DATE NOT NULL,
        priority VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db`
      CREATE TABLE performance_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      reviewer VARCHAR(100) NOT NULL,
      rating NUMERIC(3,1) NOT NULL,
      strengths TEXT,
      improvements TEXT,
      manager_comments TEXT,
      employee_comments TEXT,
      goals_for_next_cycle TEXT,
      acknowledged BOOLEAN DEFAULT false,
      acknowledged_at TIMESTAMP DEFAULT NULL,
      status VARCHAR(30) DEFAULT 'Completed'
    );
    `;

    await db`
      CREATE TABLE user_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        level INTEGER NOT NULL,
        label VARCHAR(50) NOT NULL
      )
    `;

    await db`
      CREATE TABLE user_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db`
    CREATE TABLE one_on_one_meetings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
      topic VARCHAR(255),
      notes TEXT,
      action_items TEXT,
      status VARCHAR(30) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    await db`
CREATE TABLE self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
  cycle VARCHAR(50) NOT NULL,
  achievements TEXT,
  challenges TEXT,
  future_goals TEXT,
  submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP,
  CONSTRAINT self_assessments_user_cycle_unique
  UNIQUE (user_id, cycle)
);
`;

    await db`
    CREATE TABLE performance_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `;

    await db`
    CREATE TABLE career_development (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_position VARCHAR(100),
    target_position VARCHAR(100),
    roadmap TEXT,
    target_date DATE
);
    `;

    await db`
  CREATE TABLE performance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    month DATE NOT NULL,
    productivity INTEGER,
    quality INTEGER,
    teamwork INTEGER,
    attendance INTEGER,
    CONSTRAINT performance_history_user_month_unique
        UNIQUE (user_id, month)
);
    `;

    await db`
    CREATE TABLE IF NOT EXISTS skills (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      label VARCHAR(100) NOT NULL,
      level INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

    //Payroll tables just added.
    await db`
      CREATE TABLE pay_stubs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        pay_date DATE NOT NULL,
        gross_pay DECIMAL(10,2) NOT NULL,
        net_pay DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'paid', -- 'processing', 'paid', 'held'
        pdf_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `;

    await db`
    CREATE TABLE pay_stub_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pay_stub_id UUID NOT NULL REFERENCES pay_stubs(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL, -- 'earning' or 'deduction'
      category VARCHAR(50) NOT NULL, -- 'base_salary', 'performance_bonus', 'tax', 'insurance'
      description VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL
);
    `;

    await db`
      CREATE TABLE payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bank_name VARCHAR(100) NOT NULL,
        account_holder VARCHAR(100) NOT NULL,
        account_number_masked VARCHAR(20) NOT NULL,
        routing_or_iban VARCHAR(100),
        is_primary BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'pending'
      );
    `;

    await db`
      CREATE TABLE job_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        type VARCHAR(50) DEFAULT 'Full-time',
        location VARCHAR(100) DEFAULT 'Remote',
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
`;

    await db`
      CREATE TABLE education_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        level VARCHAR(100) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        location VARCHAR(200),
        score VARCHAR(50),
        start_year INT,
        end_year INT,
        document_url TEXT, -- For the "Add Document" feature
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // language table
    await db`
      CREATE TABLE employee_languages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        language VARCHAR(100) NOT NULL,
        listening VARCHAR(50) NOT NULL,
        reading VARCHAR(50) NOT NULL,
        writing VARCHAR(50) NOT NULL,
        speaking VARCHAR(50) NOT NULL,
        created_by VARCHAR(255) NOT NULL DEFAULT 'System Administrator',
        document_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // document table
    await db`
      CREATE TABLE employee_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        document_type VARCHAR(100) NOT NULL, -- Selected category (e.g. 'Employment Contract', 'National ID', 'Degree Certificate', 'Tax Form')
        file_name VARCHAR(255) NOT NULL,       -- Uploaded filename (e.g., 'Yad_Contract_2026.pdf')
        file_extension VARCHAR(20) NOT NULL,   -- File format (e.g., 'pdf', 'png', 'docx')
        file_url TEXT NOT NULL,                -- Download link / storage URL
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
`;

    const adminPassword = await bcrypt.hash("AdminPass123", 10);
    const employeePassword = await bcrypt.hash("EmployeePass123", 10);

    const seededUsers = await db`
     INSERT INTO users (
        employee_id, name, preferred_name, job_title, job_family, employment_type, manager_name, join_date, 
        department, branch, date_of_birth, age, gender, nationality, marital_status, 
        blood_group, email, personal_email, personal_phone, current_address, 
        password_hash, role, status, base_salary, 
        public_org, private_org, insurance, subscription,
        image_url, shift_start, shift_end, shift_type, working_days, last_seen_at
       )
      VALUES  
        (
          'EMP-1001', 'Admin Manager', 'Admin', 'HR Director', 'Human Resources', 'Full-Time', 'CEO', '2020-01-15',
          'Human Resources', 'HQ - Sulaymaniyah',
          '1988-03-15', 38, 'Female', 'Iraqi', 'Married', 'O+',
          'admin@company.com', 'admin.personal@gmail.com', '+964 770 111 2233',
          'Main Street, District 101, Sulaymaniyah', ${adminPassword}, 'admin', 'Active',
          5000.00, NULL, NULL, 'Premium Health', NULL,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Standard (Mon - Fri)', '{1,2,3,4,5}', CURRENT_TIMESTAMP
        ),
        (
          'EMP-1006', 'Sarah Jenkins', 'Sarah', 'Head of Engineering', 'Engineering', 'Full-Time', 'CEO', '2019-05-10',
          'Engineering', 'HQ - Sulaymaniyah',
          '1985-08-22', 40, 'Female', 'American', 'Married', 'A+',
          'sarah.j@company.com', 'sarah.j.personal@gmail.com', '+964 770 999 8877',
          'Tech Park, Sulaymaniyah', ${adminPassword}, 'admin', 'Active',
          6000.00, NULL, NULL, 'Premium Health', NULL,
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Standard (Mon - Fri)', '{1,2,3,4,5}', CURRENT_TIMESTAMP
        ),
        (
          'EMP-1007', 'Alex Studio', 'Alex', 'Head of Design', 'Design', 'Full-Time', 'CEO', '2020-11-20',
          'Design', 'HQ - Sulaymaniyah',
          '1990-12-05', 35, 'Male', 'British', 'Single', 'B-',
          'alex.s@company.com', 'alex.s.personal@gmail.com', '+964 770 666 5544',
          'Creative Hub, Sulaymaniyah', ${adminPassword}, 'admin', 'Active',
          5500.00, NULL, NULL, 'Premium Health', 'Adobe CC',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Standard (Mon - Fri)', '{1,2,3,4,5}', CURRENT_TIMESTAMP
        ),
         
        (
          'EMP-1002', 'Yad Developer', 'Yad', 'Software Engineer', 'Engineering', 'Full-Time', 'Sarah Jenkins', '2022-03-01',
          'Engineering', 'HQ - Sulaymaniyah', -- CHANGED TO Engineering
          '2002-05-20', 24, 'Male', 'Iraqi', 'Single', 'A+',
          'yad@company.com', 'yad.dev@gmail.com', '+964 770 222 3344',
          'Salim Street, Sulaymaniyah', ${employeePassword}, 'employee', 'Active',
          4200.00, NULL, NULL, 'Standard Health', 'GitHub Copilot',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Weekend Flex', '{6,0,1}', CURRENT_TIMESTAMP
        ),
        (
          'EMP-1003', 'Lana Amin', 'Lana', 'Product Designer', 'Design', 'Full-Time', 'Alex Studio', '2023-06-10',
          'Design', 'HQ - Sulaymaniyah', -- CHANGED TO Design
          '1997-09-12', 28, 'Female', 'Iraqi', 'Single', 'B+',
          'lana@company.com', 'lana.amin@gmail.com', '+964 770 333 4455',
          'Barty Street, Sulaymaniyah', ${employeePassword}, 'employee', 'Offline',
          3800.00, NULL, NULL, 'Standard Health', 'Figma Professional',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Mid-Week Core', '{2,3,4}', CURRENT_TIMESTAMP - INTERVAL '2 hours'
        ),
        (
          'EMP-1004', 'Diyar Karwan', 'Diyar', 'Backend Engineer', 'Engineering', 'Full-Time', 'Sarah Jenkins', '2021-11-20',
          'Engineering', 'HQ - Sulaymaniyah', -- CHANGED TO Engineering
          '1995-11-04', 30, 'Male', 'Iraqi', 'Married', 'O-',
          'diyar@company.com', 'diyar.karwan@gmail.com', '+964 770 444 5566',
          'Sarchinar Way, Sulaymaniyah', ${employeePassword}, 'employee', 'Offline',
          4000.00, NULL, NULL, 'Standard Health', 'AWS Builder',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Standard (Mon - Fri)', '{1,2,3,4,5}', CURRENT_TIMESTAMP - INTERVAL '1 day'
        ),
        (
          'EMP-1005', 'Sara Omar', 'Sara', 'QA Engineer', 'Engineering', 'Full-Time', 'Sarah Jenkins', '2024-01-05',
          'Engineering', 'HQ - Sulaymaniyah', -- CHANGED TO Engineering
          '1999-01-28', 27, 'Female', 'Iraqi', 'Single', 'AB+',
          'sara@company.com', 'sara.omar@gmail.com', '+964 770 555 6677',
          'Rapakarin Quarter, Sulaymaniyah', ${employeePassword}, 'employee', 'Active',
          3500.00, NULL, NULL, 'Standard Health', NULL,
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
          '09:00:00', '17:00:00', 'Standard (Mon - Fri)', '{1,2,3,4,5}', CURRENT_TIMESTAMP - INTERVAL '5 minutes'
        )
      
      RETURNING id, role, name, manager_name;
      `;

    await db`
      CREATE TABLE leave_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,                 
      leave_category VARCHAR(50),               
      start_date DATE,
      end_date DATE,
      total_days INT DEFAULT 0,
      hours INT DEFAULT 0,
      original_date DATE,                         
      exchange_date DATE,  
      helper_id UUID REFERENCES users(id) ON DELETE SET NULL, 
      helper_status VARCHAR(50) DEFAULT 'Pending', 
      
      reason TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`;

    await db`
  CREATE TABLE shift_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INT DEFAULT 15 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )
`;

    await db`
  CREATE TABLE employment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    period VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

    await db`
  INSERT INTO shift_rules (shift_name, start_time, end_time, grace_period_minutes)
  VALUES 
    ('Standard Shift (GMT+3)', '09:00:00', '17:00:00', 15),
    ('Engineering Flex', '10:00:00', '18:00:00', 30)
`;

    await db`
    CREATE TABLE IF NOT EXISTS performance_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    topic VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `;

    // adding admin ID
    const adminId = seededUsers.find((user) => user.role === "admin")?.id;
    if (!adminId) throw new Error("Admin user not found");

    const managers = seededUsers.filter((user) => user.role === "admin");
    const employees = seededUsers.filter((user) => user.role === "employee");

    for (const emp of employees) {
      const employeeManager =
        managers.find((m) => m.name === emp.manager_name) || managers[0];
      const managerId = employeeManager.id;

      await db`
        INSERT INTO leave_balances (
          user_id, 
          annual_total, 
          annual_remaining, 
          sick_total, 
          sick_remaining,
          monthly_total_hours,
          monthly_remaining_hours
        )
        VALUES (
          ${emp.id}, 
          20, 
          14, 
          10, 
          8,
          16,
          16
        );
      `;

      // Specific Data just for your test user

      // --- Original HR Dummy Data ---
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
  INSERT INTO user_kpis (user_id, label, value, target, trend, is_up)
  VALUES
    (${emp.id}, 'Attendance Rate', '0.0%', '95.0%', '+0.0%', true),
    (${emp.id}, 'Punctuality (On-Time)', '0.0%', '90.0%', '+0.0%', false),
    (${emp.id}, 'Team Collaboration', '4.8/5', '4.5/5', '+0.3', true),
    (${emp.id}, 'Task Completion Rate', '92.0%', '90.0%', '+5.0%', true);
`;
      await db`
          INSERT INTO wfh_requests (user_id, request_date, reason, status)
          VALUES (${emp.id}, '2026-07-28', 'Working on server optimization and require quiet space.', 'Pending')
        `;

      await db`
INSERT INTO user_performance (
    user_id,
    rating,
    cycle,
    next_review,
    status
)
VALUES (
    ${emp.id},
    4.8,
    'Q3 2026 Review',
    '2026-12-15',
    'Excellent'
)
ON CONFLICT (user_id) DO NOTHING;
`;

      // ----------------------------------------------------
      // GOALS
      // ----------------------------------------------------
      await db`
INSERT INTO user_goals (
    user_id,
    title,
    description,
    progress,
    due_date,
    priority,
    status
)
VALUES
(
    ${emp.id},
    'React Sprint Course Architecture',
    'Design and compress the intro curriculum.',
    100,
    '2026-02-28',
    'High',
    'Completed'
),
(
    ${emp.id},
    'Next.js & PostgreSQL Migration',
    'Move legacy endpoints to Server Actions.',
    75,
    '2026-08-30',
    'High',
    'In Progress'
),
(
    ${emp.id},
    'Unreal Engine 5 UI Integration',
    'Prototype rendering environment prompts.',
    30,
    '2026-10-15',
    'Medium',
    'In Progress'
);
`;

      // ----------------------------------------------------
      // PERFORMANCE REVIEW
      // ----------------------------------------------------
      await db`
INSERT INTO performance_reviews (
    user_id,
    period,
    date,
    reviewer,
    rating,
    strengths,
    improvements,
    manager_comments,
    employee_comments,
    goals_for_next_cycle,
    status
)
VALUES
(
    ${emp.id},
    'Q1-Q2 2026',
    '2026-06-15',
    'Sarah Jenkins',
    4.8,
    'Excellent ownership, strong React architecture, mentors junior developers.',
    'Improve enterprise system design documentation.',
    'Consistently exceeds expectations and demonstrates leadership.',
    'I would like to contribute more to backend architecture.',
    'Lead one enterprise project and mentor two junior developers.',
    'Completed'
);
`;

      // ----------------------------------------------------
      // CAREER DEVELOPMENT
      // ----------------------------------------------------
      await db`
    INSERT INTO career_development (
        user_id,
        current_position,
        target_position,
        roadmap,
        target_date
    )
    VALUES
    (
        ${emp.id},
        'Software Engineer',
        'Senior Software Engineer',
        'Master System Design
    Lead a cross-functional project
    Mentor junior developers
    Improve architecture documentation',
        '2027-01-01'
    )
    ON CONFLICT (user_id) DO NOTHING;
`;

      await db`
    INSERT INTO one_on_one_meetings (
        employee_id,
        manager_id,
        meeting_date,
        topic,
        notes,
        action_items,
        status
    )
    VALUES
    (
        ${emp.id},
        ${managerId},
        '2026-07-15',
        'Quarterly Growth Discussion',
        'Discussed progress in Next.js migration and backend ownership.',
        'Complete system design training and lead authentication refactor.',
        'Completed'
    ),
    (
        ${emp.id},
        ${managerId},
        '2026-10-10',
        'Q4 Planning',
        'Review progress toward Senior Engineer promotion.',
        'Finish architecture documentation.',
        'Scheduled'
    );
`;

      await db`
INSERT INTO performance_notifications (
    user_id,
    title,
    description,
    type,
    is_read
)
VALUES
(
    ${emp.id},
    'Self Assessment Due',
    'Complete your Q3 self assessment before July 30.',
    'Assessment',
    false
),
(
    ${emp.id},
    'Performance Review Scheduled',
    'Your annual review has been scheduled for December 15.',
    'Review',
    false
),
(
    ${emp.id},
    'Goal Deadline Approaching',
    'Your Next.js migration goal is due in 12 days.',
    'Goal',
    true
),
(
    ${emp.id},
    'Recognition Received',
    'Sarah Jenkins recognized your outstanding leadership.',
    'Recognition',
    true
);
`;

      // ----------------------------------------------------
      // PERFORMANCE HISTORY (for chart)
      // ----------------------------------------------------
      await db`
INSERT INTO performance_history (
    user_id,
    month,
    productivity,
    quality,
    teamwork,
    attendance
)
VALUES
(${emp.id}, '2026-02-01', 72, 75, 70, 96),
(${emp.id}, '2026-03-01', 76, 78, 74, 97),
(${emp.id}, '2026-04-01', 82, 84, 80, 98),
(${emp.id}, '2026-05-01', 86, 87, 84, 98),
(${emp.id}, '2026-06-01', 91, 92, 90, 99),
(${emp.id}, '2026-07-01', 95, 96, 94, 99)
ON CONFLICT (user_id, month) DO NOTHING;
`;

      // ----------------------------------------------------
      // SELF ASSESSMENT
      // ----------------------------------------------------
      await db`
          INSERT INTO self_assessments (
    user_id,
    cycle,
    achievements,
    challenges,
    future_goals,
    submitted,
    submitted_at
)
VALUES
(
    ${emp.id},
    'Q3 2026',
    'Completed major migration to Next.js Server Actions and improved application performance.',
    'Balancing feature development with documentation.',
    'Lead architecture initiatives and mentor junior developers.',
    true,
    NOW()
)
ON CONFLICT (user_id, cycle) DO NOTHING;
`;

      // ----------------------------------------------------
      // SKILLS
      // ----------------------------------------------------

      await db`
      INSERT INTO skills (user_id, name, label, level) VALUES
        (${emp.id}, 'React & Next.js', 'Technical', 5),
        (${emp.id}, 'PostgreSQL & SQL', 'Architecture', 4),
        (${emp.id}, 'Node.js & Express', 'Technical', 4),
        (${emp.id}, 'System Architecture', 'Architecture', 3)
    `;

      // ----------------------------------------------------
      // FEEDBACK
      // ----------------------------------------------------
      await db`
INSERT INTO user_feedback (
    user_id,
    sender,
    role,
    date,
    type,
    text,
    is_read
)
VALUES
(
    ${emp.id},
    'Sarah Jenkins',
    'Engineering Manager',
    '2026-07-20',
    'Positive',
    'Outstanding leadership during the migration project. Your architecture decisions significantly improved maintainability.',
    true
),
(
    ${emp.id},
    'Alex Chen',
    'Senior Developer',
    '2026-07-15',
    'Recognition',
    'Thank you for helping debug the SQL optimization issue and reviewing my pull request.',
    true
),
(
    ${emp.id},
    'Sarah Jenkins',
    'Engineering Manager',
    '2026-06-10',
    'Constructive',
    'Consider documenting architectural decisions earlier so the rest of the team can follow implementation more easily.',
    false
);
`;

      await db`
        INSERT INTO job_postings (title, department, type, location, status)
        VALUES
          ('Senior Frontend Engineer', 'Software Engineering', 'Full-time', 'Remote', 'Open'),
          ('Product Designer', 'UI/UX Design', 'Full-time', 'HQ - Sulaymaniyah', 'Open')
`;

      // ----------------------------------------------------
      // EDUCATION HISTORY
      // ----------------------------------------------------
      await db`
        INSERT INTO education_history (
          user_id, 
          level, 
          subject, 
          institution, 
          location, 
          score, 
          start_year, 
          end_year
        ) VALUES 
        (
          ${emp.id}, 
          'Bachelor', 
          'Computer Engineering', 
          'Sulaimanyah University', 
          'Sulaymaniyah', 
          '3.5 GPA', 
          2020, 
          2024
        ),
        (
          ${emp.id}, 
          'High School Diploma', 
          'Scientific Track', 
          'UOS High School', 
          'Sulaymaniyah', 
          '96%', 
          2017, 
          2020
        )
      `;

      // ----------------------------------------------------
      // LANGUAGE COMPETENCIES SEEDING
      // ----------------------------------------------------
      await db`
        INSERT INTO employee_languages (
          user_id, 
          language, 
          listening, 
          reading, 
          writing, 
          speaking, 
          created_by
        ) VALUES 
        (
          ${emp.id}, 
          'Arabic', 
          'B1', 
          'B2', 
          'A2', 
          'B1', 
          'Yad Hussein Fatah'
        ),
        (
          ${emp.id}, 
          'Persian', 
          'B2', 
          'B2', 
          'A2', 
          'C1', 
          'Yad Hussein Fatah'
        ),
        (
          ${emp.id}, 
          'English', 
          'C1', 
          'C1', 
          'C1', 
          'C1', 
          'System Administrator'
        )
      `;

      await db`
        INSERT INTO employee_documents (
          user_id, 
          document_type, 
          file_name, 
          file_extension, 
          file_url
        ) VALUES 
        (
          ${emp.id}, 
          'Employment Contract', 
          'employment_contract_2026.pdf', 
          'pdf', 
          'https://example.com/docs/employment_contract_2026.pdf'
        ),
        (
          ${emp.id}, 
          'National ID', 
          'national_identity_card.png', 
          'png', 
          'https://example.com/docs/national_identity_card.png'
        ),
        (
          ${emp.id}, 
          'Degree Certificate', 
          'bachelors_degree_certificate.pdf', 
          'pdf', 
          'https://example.com/docs/bachelors_degree_certificate.pdf'
        );
`;

      await db`
      INSERT INTO employment_history (
        user_id, 
        title, 
        company,
        period
      ) VALUES 
      (
        ${emp.id},  
        'Senior Software Engineer', 
        'Tech Solutions Inc.',
        'Mar 2024 → Present'
      ),
      (
        ${emp.id}, 
        'Software Engineer', 
        'Dev Agency LLC',
        'Jan 2022 → Feb 2024'
      )
`;

      //----------------------------------
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
