// @/app/lib/employeeDashboard/performance/actions/utils.ts
"use server";

import { auth } from "@/auth";
 
export async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log("Authenticated user ID:", session.user.id); 
  return session.user.id;
}
