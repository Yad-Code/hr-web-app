// app/lib/employeeList/definitions.ts

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: "admin" | "employee";
  status: "active" | "offline";
  image_url: string | null;
  last_seen_text: string;
}

export interface FullEmployeeProfile {
  id: string;
  employee_id?: string | null;
  name: string;
  email: string;
  department?: string | null;
  branch?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  role?: string | null;
  status?: string | null;
  image_url?: string | null;
  preferred_name?: string | null;
  marital_status?: string | null;
  blood_group?: string | null;
  personal_email?: string | null;
  personal_phone?: string | null;
  current_address?: string | null;
  base_salary?: number;
}
