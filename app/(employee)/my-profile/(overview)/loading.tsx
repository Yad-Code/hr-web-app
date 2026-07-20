// app/employee/profile/loading.tsx
import {
  ProfileHeaderSkeleton,
  OfficialInfoCardSkeleton,
  ProfileFormSkeleton,
} from "@/app/ui/employee/skeleton";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4 text-left select-none">
      <ProfileHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfficialInfoCardSkeleton />
        <ProfileFormSkeleton />
      </div>
    </div>
  );
}