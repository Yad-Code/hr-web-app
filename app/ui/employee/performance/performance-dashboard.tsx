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
  Colleague,
} from "@/app/lib/employeeDashboard/performance/definitions";

import PerformanceHeader from "./performance-header";
import OverviewTab from "./tabs/overview-tab";
import GoalsTab from "./tabs/goals-tab";
import ReviewsTab from "./tabs/reviews-tab";
import FeedbackTab from "./tabs/feedback-tab";
import SkillsTab from "./tabs/skills-tab";
import SelfAssessmentTab from "./tabs/self-assessment-tab";
import CareerTab from "./tabs/career-tab";

export interface DashboardData {
  profile: PerformanceProfile | null;
  kpis: KPI[];
  goals: Goal[];
  reviews: PerformanceReview[];
  skills: Skill[];
  feedback: Feedback[];
  career: CareerDevelopment | null;
  meetings: OneOnOneMeeting[];
  notifications: PerformanceNotification[];
  history: PerformanceHistory[];
  selfAssessment: SelfAssessment | null;
  colleagues: Colleague[];
}

export default function PerformanceDashboard({
  initialData,
}: {
  initialData: DashboardData;
}) {
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
    <div className="flex flex-col gap-6">
      {/* Profile Header */}
      <PerformanceHeader profile={initialData.profile} />

      {/* Tab Controls */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap cursor-pointer rounded-t-lg ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
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
            onNavigateTab={setActiveTab} /* <--- Pass state setter here */
          />
        )}
        {activeTab === "goals" && <GoalsTab goals={initialData.goals} />}
        {activeTab === "reviews" && (
          <ReviewsTab reviews={initialData.reviews} />
        )}
        {activeTab === "feedback" && (
          <FeedbackTab
            feedbackList={initialData.feedback}
            colleagues={initialData.colleagues}
          />
        )}
        {activeTab === "skills" && <SkillsTab skills={initialData.skills} />}
        {activeTab === "self-assessment" && (
          <SelfAssessmentTab assessment={initialData.selfAssessment} />
        )}
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
