// app/lib/employeeList/definitions.ts
export type { FullEmployeeProfile } from "@/app/lib/employee/definitions";

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
