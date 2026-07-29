// app/lib/definitions/performance.ts

export type DateValue = string | Date;

export type PerformanceProfile = {
  rating: number;
  cycle: string;
  next_review: string;
  status: string;
};

export type KPI = {
  id: string;
  user_id: string;
  label: string;
  value: string;
  target: string;
  trend: string;
  is_up: boolean;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  progress: number;
  due_date: DateValue;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed" | "Overdue";
  created_at: DateValue;
  updated_at: DateValue;
};

export interface NewGoalData {
  title: string;
  description?: string; // Made optional
  priority: "Low" | "Medium" | "High";
  due_date: string;
}

export type PerformanceReview = {
  id: string;
  user_id: string;
  period: string;
  date: DateValue;
  reviewer: string;
  rating: number;
  strengths: string;
  improvements: string;
  manager_comments: string;
  employee_comments: string | null;
  goals_for_next_cycle: string;
  status: "Draft" | "Completed";
};

export type Skill = {
  id: string;
  user_id: string;
  name: string;
  level: number;
  label: string;
};

export type Feedback = {
  id: string;
  user_id: string;
  sender: string;
  role: string;
  date: DateValue;
  type: "Positive" | "Constructive" | "Recognition";
  text: string;
  is_read: boolean;
  created_at: DateValue;
};

export type CareerDevelopment = {
  user_id: string;
  current_position: string;
  target_position: string;
  roadmap: string | null;
  target_date: DateValue;
};

export type OneOnOneMeeting = {
  id: string;
  employee_id: string;
  manager_id: string;
  manager_name?: string;
  meeting_date: DateValue;
  topic: string | null;
  notes: string | null;
  action_items: string | null;
  status: "Scheduled" | "Completed" | "Cancelled";
  created_at: DateValue;
};

export type PerformanceNotification = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "Assessment" | "Review" | "Goal" | "Recognition";
  is_read: boolean;
  created_at: DateValue;
};

export type PerformanceHistory = {
  id: string;
  user_id: string;
  month: DateValue;
  productivity: number;
  quality: number;
  teamwork: number;
  attendance: number;
};

export type SelfAssessment = {
  id: string;
  user_id: string;
  cycle: string;
  achievements: string;
  challenges: string;
  future_goals: string;
  submitted: boolean;
  submitted_at: DateValue | null;
};

// OneOnOnes

// Add to app/lib/performance/definitions.ts

export interface RequestMeetingData {
  topic: string;
  meeting_date: string;
  notes?: string;
}

export interface UpdateCareerData {
  current_position: string;
  target_position: string;
  target_date: string;
  roadmap?: string;
}