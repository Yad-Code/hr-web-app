// @/app/lib/employee/payroll/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";

export type EmployeePayrollRecord = {
  id: string;
  user_id: string;
  employee_name: string;
  employee_email: string;
  image_url: string;
  pay_period_start: Date;
  pay_period_end: Date;
  pay_date: Date;
  gross_pay: number;
  net_pay: number;
  status: "processing" | "paid" | "held";
};

export async function addPaymentMethod(userId: string, formData: FormData) {
  "use server";

  const bankName = formData.get("bank_name") as string;
  const accountHolder = formData.get("account_holder") as string;
  const accountNumber = formData.get("account_number") as string;
  const routingOrIban = formData.get("routing_or_iban") as string;

  // Mask the account number to store securely (e.g., •••• 1234)
  const last4 = accountNumber.slice(-4);
  const maskedNumber = `•••• ${last4}`;

  try {
    await db`
      INSERT INTO payment_methods (user_id, bank_name, account_holder, account_number_masked, routing_or_iban, is_primary, status)
      VALUES (${userId}, ${bankName}, ${accountHolder}, ${maskedNumber}, ${routingOrIban}, false, 'pending')
    `;
    // FIXED: Match your actual page route /payroll instead of /my-profile/payroll
    revalidatePath("/payroll");
  } catch (error) {
    console.error("Failed to add payment method:", error);
    throw new Error("Database insertion failed.");
  }
}
