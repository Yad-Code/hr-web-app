"use client";

import React from "react";
import { SelfAssessment } from "@/app/lib/employeeDashboard/performance/definitions";
import AdminSelfAssessmentView from "@/app/ui/dashboard/performance/admin-self-assessment-view";

interface AdminPerformanceTabProps {
  assessment: SelfAssessment | null;
  employeeName: string;
}

export default function AdminPerformanceTab({
  assessment,
  employeeName,
}: AdminPerformanceTabProps) {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* You can add an AdminHeader here later if you want, just like your other tabs! */}

      <AdminSelfAssessmentView
        assessment={assessment}
        employeeName={employeeName}
      />

      {/* Future features like Manager Comments can go here */}
    </div>
  );
}
