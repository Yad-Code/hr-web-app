
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