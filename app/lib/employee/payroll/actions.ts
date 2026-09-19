// @/app/lib/employee/payroll/actions.ts
"use server";

import { auth } from "@/auth";
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

export async function addPaymentMethod(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;
    const bankName = formData.get("bank_name") as string;
    const accountHolder = formData.get("account_holder") as string;
    const accountNumber = formData.get("account_number") as string;
    const routingOrIban = formData.get("routing_or_iban") as string;

    if (!bankName || !accountHolder || !accountNumber || !routingOrIban) {
      throw new Error("All fields are required.");
    }

    const last4 = accountNumber.slice(-4);
    const maskedNumber = `•••• ${last4}`;

    await db`
      INSERT INTO payment_methods (user_id, bank_name, account_holder, account_number_masked, routing_or_iban, is_primary, status)
      VALUES (${userId}::uuid, ${bankName}, ${accountHolder}, ${maskedNumber}, ${routingOrIban}, false, 'pending')
    `;

    revalidatePath("/my-profile/payroll");
    return { success: true };
  } catch (error) {
    console.error("Failed to add payment method:", error);
    throw new Error("Database insertion failed.");
  }
}
