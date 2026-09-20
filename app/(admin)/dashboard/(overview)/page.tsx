// @/app/(admin)/dashboard/(overview)/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";  
import AdminCardsWrapper from "./_components/cards-wrapper";
import AdminChartWrapper from "./_components/chart-wrapper";
import { QuickOperationsWidget } from "./_components/quick-operations";
import { SecondaryWidgets } from "./_components/secondary-widgets";
import { lusitana } from "@/app/ui/fonts";
import { auth } from "@/auth";
import { verifyFeatureAccess } from "@/app/lib/auth/access-control"; 

import {
  RetentionEngagementChartSkeleton,
  EmployeeActivitySkeleton,
  CardsGridSkeleton,
} from "@/app/ui/skeletons";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) return null;
 
  const canViewDashboard = await verifyFeatureAccess(
    session.user.id,
    "view_dashboard",
  );
  if (!canViewDashboard) {
    redirect("/my-profile");
  }

  // ABAC Dynamic UI check for the header title
  const hasGlobalView = await verifyFeatureAccess(
    session.user.id,
    "manage_system",
  );

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="border-b border-slate-100 pb-5 text-left">
        <h1
          className={`${lusitana.className} text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900`}
        >
          {hasGlobalView ? "Company Overview" : "Team Overview"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics and company workforce analytics trends.
        </p>
      </div>

      <Suspense fallback={<CardsGridSkeleton />}>
        <AdminCardsWrapper />
      </Suspense>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col justify-between w-full">
          <Suspense fallback={<RetentionEngagementChartSkeleton />}>
            <AdminChartWrapper />
          </Suspense>
        </div>

        <Suspense fallback={<EmployeeActivitySkeleton />}>
          <QuickOperationsWidget />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="h-48 bg-slate-50 rounded-2xl animate-pulse" />
        }
      >
        <SecondaryWidgets />
      </Suspense>
    </main>
  );
}
