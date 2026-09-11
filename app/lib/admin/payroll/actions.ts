// @/app/lib/admin/payroll/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

async function verifyAdminAction() {
  const session = await auth();
  return session?.user?.isAdmin;  
}

export async function generateMonthlyPayroll() {
  if (!(await verifyAdminAction()))
    return {
      success: false,
      message: "Unauthorized. Only HR Admins can generate company payroll.",
    };

  try {
    const users = await db`
      SELECT id, base_salary, public_org, private_org, insurance, subscription   
      FROM users WHERE status = 'Active'
    `;

    if (users.length === 0)
      return { success: false, message: "No active users found." };

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const startOfMonth = `${year}-${month}-01`;
    const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
    const endOfMonth = `${year}-${month}-${lastDay}`;
    const payDate = endOfMonth;

    const existingStubs =
      await db`SELECT id FROM pay_stubs WHERE pay_period_start = ${startOfMonth} LIMIT 1`;
    if (existingStubs.length > 0)
      return {
        success: false,
        message: "Payroll for this month has already been generated.",
      };

    await db.begin(async (tx) => {
      for (const user of users) {
        const grossPay = Number(user.base_salary);
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
    return { success: false, message: "Failed to generate payroll." };
  }
}

export async function markAsPaid(payStubId: string) {
  if (!(await verifyAdminAction())) throw new Error("Unauthorized");
  try {
    await db`UPDATE pay_stubs SET status = 'paid' WHERE id = ${payStubId}`;
    revalidatePath("/dashboard/payroll");
    revalidatePath(`/dashboard/payroll/${payStubId}`);
  } catch (error) {
    console.error("Payment Error:", error);
    throw new Error("Failed to process payment.");
  }
}

export async function verifyPaymentMethod(
  paymentMethodId: string,
  payStubId: string,
) {
  if (!(await verifyAdminAction())) throw new Error("Unauthorized");
  try {
    await db`UPDATE payment_methods SET status = 'verified' WHERE id = ${paymentMethodId}`;
    revalidatePath(`/dashboard/payroll/${payStubId}`);
  } catch (error) {
    console.error("Failed to verify payment method:", error);
    throw new Error("Database update failed.");
  }
}

export async function deletePayStub(payStubId: string) {
  if (!(await verifyAdminAction())) throw new Error("Unauthorized");
  try {
    await db`DELETE FROM pay_stubs WHERE id = ${payStubId}`;
    revalidatePath("/dashboard/payroll");
  } catch (error) {
    console.error("Failed to delete pay stub:", error);
    throw new Error("Database deletion failed.");
  }
  redirect("/dashboard/payroll");
}

export async function rollbackProcessingPayroll() {
  if (!(await verifyAdminAction()))
    return {
      success: false,
      message: "Unauthorized. Only HR Admins can rollback payroll.",
    };
  try {
    await db.begin(async (tx) => {
      await tx`DELETE FROM pay_stub_items WHERE pay_stub_id IN (SELECT id FROM pay_stubs WHERE status = 'processing')`;
      await tx`DELETE FROM pay_stubs WHERE status = 'processing'`;
    });
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

export async function updateEmployeeSalary(userId: string, newSalary: number) {
  if (!(await verifyAdminAction()))
    return {
      success: false,
      message: "Unauthorized. Only HR Admins can modify salaries.",
    };
  try {
    if (!newSalary || newSalary < 0)
      return {
        success: false,
        message: "Please provide a valid positive salary amount.",
      };
    await db`UPDATE users SET base_salary = ${newSalary} WHERE id = ${userId}`;
    revalidatePath("/dashboard/payroll");
    revalidatePath("/dashboard/employees");
    return { success: true, message: "Base salary updated successfully." };
  } catch (error) {
    console.error("Salary Update Error:", error);
    return { success: false, message: "Failed to update employee salary." };
  }
}
