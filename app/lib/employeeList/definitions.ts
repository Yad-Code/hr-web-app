
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  image_url: string | null;
  status: "active" | "offline";
  last_seen_text: string;
  department?: string;
}

export interface FullEmployeeProfile {
  id: string;
  name: string;
  email: string;
  department?: string | null;
  role?: string | null;
  status?: string | null;
  image_url?: string | null;
  preferred_name?: string | null;
  marital_status?: string | null;
  blood_group?: string | null;
  personal_email?: string | null;
  personal_phone?: string | null;
  current_address?: string | null;
}