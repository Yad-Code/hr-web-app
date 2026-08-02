// @/app/lib/admin/payroll/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function generateMonthlyPayroll() {
  try {
    // Select the employee's custom base_salary
    const users = await db`
      SELECT id, base_salary 
      FROM users 
      WHERE status = 'Active'
    `;

    if (users.length === 0)
      return { success: false, message: "No active users found." };

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    const payDate = new Date(today.getFullYear(), today.getMonth() + 1, 5)
      .toISOString()
      .split("T")[0];

    for (const user of users) {
      const grossPay = Number(user.base_salary);
      const tax = grossPay * 0.1; // 10% tax
      const insurance = 200.0;
      const netPay = grossPay - tax - insurance;

      const [stub] = await db`
        INSERT INTO pay_stubs (user_id, pay_period_start, pay_period_end, pay_date, gross_pay, net_pay, status) 
        VALUES (${user.id}, ${startOfMonth}, ${endOfMonth}, ${payDate}, ${grossPay}, ${netPay}, 'processing')
        RETURNING id
      `;

      await db`
        INSERT INTO pay_stub_items (pay_stub_id, type, category, description, amount) 
        VALUES 
          (${stub.id}, 'earning', 'base_salary', 'Monthly Base Salary', ${grossPay}),
          (${stub.id}, 'deduction', 'tax', 'Income Tax (10%)', ${tax}),
          (${stub.id}, 'deduction', 'insurance', 'Health Insurance Premium', ${insurance})
      `;
    }

    revalidatePath("/dashboard/payroll");
    return { success: true, message: "Payroll generated successfully." };
  } catch (error) {
    console.error("Payroll Generation Error:", error);
    return { success: false, message: "Failed to generate payroll." };
  }
}

// NEW: Action to mark a pay stub as paid
export async function markAsPaid(payStubId: string) {
  try {
    await db`UPDATE pay_stubs SET status = 'paid' WHERE id = ${payStubId}`;
    revalidatePath("/dashboard/payroll");
    revalidatePath(`/dashboard/payroll/${payStubId}`);
  } catch (error) {
    console.error("Payment Error:", error);
    throw new Error("Failed to process payment.");
  }
}

export async function fetchEmployeePaymentMethods(userId: string) {
  const methods = await db`
    SELECT pm.*, u.name as account_holder 
    FROM payment_methods pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.user_id = ${userId}
  `;
  return methods;
}

export async function verifyPaymentMethod(
  paymentMethodId: string,
  payStubId: string,
) {
  try {
    await db`
      UPDATE payment_methods 
      SET status = 'verified' 
      WHERE id = ${paymentMethodId}
    `;

    revalidatePath(`/dashboard/payroll/${payStubId}`);
  } catch (error) {
    console.error("Failed to verify payment method:", error);
    throw new Error("Database update failed.");
  }
}

export async function deletePayStub(payStubId: string) {
  try {
    await db`
      DELETE FROM pay_stubs 
      WHERE id = ${payStubId}
    `;

    revalidatePath("/dashboard/payroll");
  } catch (error) {
    console.error("Failed to delete pay stub:", error);
    throw new Error("Database deletion failed.");
  }

  // 2. Actually redirect the user to the table
  redirect("/dashboard/payroll");
}

export async function rollbackProcessingPayroll() {
  try {
    // Only delete pay stubs that haven't been paid yet
    await db`
      DELETE FROM pay_stubs 
      WHERE status = 'processing'
    `;

    revalidatePath("/dashboard/payroll");
    return {
      success: true,
      message: "Processing payroll cleared successfully.",
    };
  } catch (error) {
    console.error("Rollback Error:", error);
    return { success: false, message: "Failed to rollback payroll." };
  }
}

// Add to @/app/lib/admin/payroll/actions.ts

export async function updateEmployeeSalary(userId: string, newSalary: number) {
  try {
    await db`
      UPDATE users 
      SET base_salary = ${newSalary} 
      WHERE id = ${userId}
    `;

    revalidatePath("/dashboard/payroll");
    revalidatePath("/dashboard/employees");
    return { success: true, message: "Salary updated successfully." };
  } catch (error) {
    console.error("Salary Update Error:", error);
    return { success: false, message: "Failed to update salary." };
  }
}
