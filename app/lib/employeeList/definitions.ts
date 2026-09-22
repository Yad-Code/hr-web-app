// app/lib/employeeList/definitions.ts
export type { FullEmployeeProfile } from "@/app/lib/employee/definitions";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  branch?: string;
  preferred_name?: string;
  role: string;
  status: string;
  image_url: string | null;
  last_seen_text: string;
  manager_id?: string | null; 
}