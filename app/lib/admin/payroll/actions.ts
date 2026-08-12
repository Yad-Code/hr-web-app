// @/app/lib/admin/payroll/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function generateMonthlyPayroll() {
  try {
    const users = await db`
      SELECT 
        id, 
        base_salary,
        public_org,    
        private_org,   
        insurance,     
        subscription   
      FROM users 
      WHERE status = 'Active'
    `;

    if (users.length === 0)
      return { success: false, message: "No active users found." };

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    const startOfMonth = `${year}-${month}-01`;

    const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();

    const endOfMonth = `${year}-${month}-${lastDay}`;
    const payDate = `${year}-${String(today.getMonth() + 2).padStart(2, "0")}-05`; // Come back here and change the payment day according to the user

    // 1. Idempotency Check (Moved OUTSIDE the loop)
    const existingStubs = await db`
      SELECT id FROM pay_stubs 
      WHERE pay_period_start = ${startOfMonth} 
      LIMIT 1
    `;

    if (existingStubs.length > 0) {
      return {
        success: false,
        message: "Payroll for this month has already been generated.",
      };
    }

    // 2. Wrap all insertions in a transaction block
    // Note: If your specific db wrapper doesn't use `.begin`, you would execute
    // await db`BEGIN` before the loop, and await db`COMMIT` after it.
    await db.begin(async (tx) => {
      for (const user of users) {
        const grossPay = Number(user.base_salary);

        // Dynamic Tax Calculation
        let taxRate = 0.1;
        let taxDescription = "Standard Income Tax (10%)";

        if (user.public_org && user.private_org) {
          taxRate = 0.15;
          taxDescription = "Dual-Sector Income Tax (15%)";
        } else if (user.public_org) {
          taxRate = 0.12;
          taxDescription = "Public Sector Income Tax (12%)";
        } else if (user.private_org) {
          taxRate = 0.08;
          taxDescription = "Private Sector Income Tax (8%)";
        }

        const tax = grossPay * taxRate;

        // Dynamic Insurance Deduction
        let insuranceDeduction = 0;
        let insuranceDescription = "No Insurance Enrolled";

        if (user.insurance) {
          switch (user.insurance.toLowerCase()) {
            case "premium":
              insuranceDeduction = 350.0;
              insuranceDescription = "Premium Health Insurance";
              break;
            case "standard":
              insuranceDeduction = 150.0;
              insuranceDescription = "Standard Health Insurance";
              break;
            default:
              insuranceDeduction = 200.0;
              insuranceDescription = `${user.insurance} Health Premium`;
          }
        }

        const netPay = grossPay - tax - insuranceDeduction;

        // Note we are using `tx` here instead of `db` to keep it in the transaction
        const [stub] = await tx`
          INSERT INTO pay_stubs (user_id, pay_period_start, pay_period_end, pay_date, gross_pay, net_pay, status) 
          VALUES (${user.id}, ${startOfMonth}, ${endOfMonth}, ${payDate}, ${grossPay}, ${netPay}, 'processing')
          RETURNING id
        `;

        await tx`
          INSERT INTO pay_stub_items (pay_stub_id, type, category, description, amount) 
          VALUES 
            (${stub.id}, 'earning', 'base_salary', 'Monthly Base Salary', ${grossPay}),
            (${stub.id}, 'deduction', 'tax', ${taxDescription}, ${tax})
        `;

        if (insuranceDeduction > 0) {
          await tx`
            INSERT INTO pay_stub_items (pay_stub_id, type, category, description, amount) 
            VALUES (${stub.id}, 'deduction', 'insurance', ${insuranceDescription}, ${insuranceDeduction})
          `;
        }
      }
    });

    revalidatePath("/dashboard/payroll");
    return { success: true, message: "Payroll generated successfully." };
  } catch (error) {
    console.error("Payroll Generation Error:", error);
    // If an error happens inside the db.begin block, the database automatically rolls back everything!
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
    if (!newSalary || newSalary < 0) {
      return {
        success: false,
        message: "Please provide a valid positive salary amount.",
      };
    }

    await db`
      UPDATE users 
      SET base_salary = ${newSalary} 
      WHERE id = ${userId}
    `;

    revalidatePath("/dashboard/payroll");
    revalidatePath("/dashboard/employees");
    return { success: true, message: "Base salary updated successfully." };
  } catch (error) {
    console.error("Salary Update Error:", error);
    return { success: false, message: "Failed to update employee salary." };
  }
}
