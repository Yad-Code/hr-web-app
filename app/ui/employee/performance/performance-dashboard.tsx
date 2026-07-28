// app/ui/employee/performance/performance-dashboard.tsx
"use client";

import { useState } from "react";
import {
  PerformanceProfile,
  KPI,
  Goal,
  PerformanceReview,
  Skill,
  Feedback,
  CareerDevelopment,
  OneOnOneMeeting,
  PerformanceNotification,
  PerformanceHistory,
  SelfAssessment,
} from "@/app/lib/performance/definitions"; //[cite: 2]

import PerformanceHeader from "./performance-header";
import OverviewTab from "./tabs/overview-tab";
import GoalsTab from "./tabs/goals-tab";
import ReviewsTab from "./tabs/reviews-tab";
import FeedbackTab from "./tabs/feedback-tab";
import SkillsTab from "./tabs/skills-tab";
import SelfAssessmentTab from "./tabs/self-assessment-tab";
import CareerTab from "./tabs/career-tab";

export interface DashboardData {
  profile: PerformanceProfile | null; //[cite: 2]
  kpis: KPI[]; //[cite: 2]
  goals: Goal[]; //[cite: 2]
  reviews: PerformanceReview[]; //[cite: 2]
  skills: Skill[]; //[cite: 2]
  feedback: Feedback[]; //[cite: 2]
  career: CareerDevelopment | null; //[cite: 2]
  meetings: OneOnOneMeeting[]; //[cite: 2]
  notifications: PerformanceNotification[]; //[cite: 2]
  history: PerformanceHistory[]; //[cite: 2]
  selfAssessment: SelfAssessment | null; //[cite: 2]
}

export default function PerformanceDashboard({ initialData }: { initialData: DashboardData }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview & KPIs" },
    { id: "goals", label: "Goals" },
    { id: "reviews", label: "Reviews" },
    { id: "feedback", label: "Feedback" },
    { id: "skills", label: "Skills" },
    { id: "self-assessment", label: "Self Assessment" },
    { id: "career", label: "Career & 1:1s" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Profile Header */}
      <PerformanceHeader profile={initialData.profile} />

      {/* Tab Controls */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? "bold" : "normal",
              borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "none",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            kpis={initialData.kpis}
            history={initialData.history}
            notifications={initialData.notifications}
          />
        )}
        {activeTab === "goals" && <GoalsTab goals={initialData.goals} />}
        {activeTab === "reviews" && <ReviewsTab reviews={initialData.reviews} />}
        {activeTab === "feedback" && <FeedbackTab feedbackList={initialData.feedback} />}
        {activeTab === "skills" && <SkillsTab skills={initialData.skills} />}
        {activeTab === "self-assessment" && <SelfAssessmentTab assessment={initialData.selfAssessment} />}
        {activeTab === "career" && (
          <CareerTab
            career={initialData.career}
            meetings={initialData.meetings}
          />
        )}
      </div>
    </div>
  );
}