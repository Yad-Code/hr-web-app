export interface ReviewRow {
  id: string;
  period: string;
  date: string | Date;
  reviewer: string;
  rating: number | string;
  status: string;
  employee_name: string;
  department: string;
  image_url: string | null;
}

export interface GoalRow {
  id: string;
  title: string;
  progress: number;
  priority: string;
  due_date: string | Date;
  status: string;
  employee_name: string;
}

export interface MeetingRow {
  id: string;
  meeting_date: string | Date;
  topic: string | null;
  status: string;
  employee_name: string;
  department: string;
}

export interface PerformanceKpiData {
  avgRating: string;
  completedReviews: string;
  pendingReviews: string;
  activeGoals: string;
  submittedAssessments: string;
  currentQuarter: string; //
}

export interface FeedbackRow {
  id: string;
  type: "Positive" | "Constructive" | "Other";
  text: string;
  sender: string;
  role: string;
  date: Date;
  recipient_name: string;
  recipient_image?: string | null;
}

export interface FeedbackRequestRow {
  id: string;
  title: string;
  description: string;
  created_at: Date | string;
}