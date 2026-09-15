// @/app/lib/admin/payroll/actions.ts
"use server";

import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ExcelJS from "exceljs";

async function verifyAdminAction() {
  const session = await auth();
  return session?.user?.isAdmin;
}

export async function generateMonthlyPayroll() {
  if (!(await verifyAdminAction())) {
    return {
      success: false,
      message: "Unauthorized. Only HR Admins can generate company payroll.",
    };
  }

  try {
    const users = await db`
      SELECT id, base_salary, public_org, private_org, insurance, subscription, branch   
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
        message: "Payroll for this month already exists.",
      };

    await db.begin(async (tx) => {
      for (const user of users) {
        const grossPay = Number(user.base_salary);

        // 1. Tax Logic: 5% on amounts exceeding 1,000,000
        const taxThreshold = 1000000;
        let tax = 0;
        if (grossPay > taxThreshold) {
          tax = (grossPay - taxThreshold) * 0.05;
        }

        // 2. Insurance Logic (Assuming a standard total cost of 150,000 split 50/50)
        let totalInsurance = 0;
        if (user.insurance) {
          totalInsurance = user.insurance.toLowerCase().includes("premium")
            ? 150000
            : 75000;
        }
        const employeeInsuranceShare = totalInsurance * 0.5; // Deducted from pay
        const companyInsuranceShare = totalInsurance * 0.5; // Paid by company

        // 3. Subscription Logic
        const subscriptionDeduction = user.subscription ? 25000 : 0;

        // 4. Calculate Net
        const netPay =
          grossPay - tax - employeeInsuranceShare - subscriptionDeduction;

        const [stub] = await tx`
          INSERT INTO pay_stubs (user_id, pay_period_start, pay_period_end, pay_date, gross_pay, net_pay, status) 
          VALUES (${user.id}, ${startOfMonth}, ${endOfMonth}, ${payDate}, ${grossPay}, ${netPay}, 'processing')
          RETURNING id
        `;

        await tx`
          INSERT INTO pay_stub_items (pay_stub_id, type, category, description, amount) 
          VALUES 
            (${stub.id}, 'earning', 'base_salary', 'Monthly Base Salary', ${grossPay}),
            (${stub.id}, 'deduction', 'tax', 'Income Tax (5% over 1M)', ${tax})
        `;

        if (employeeInsuranceShare > 0) {
          await tx`INSERT INTO pay_stub_items (pay_stub_id, type, category, description, amount) VALUES (${stub.id}, 'deduction', 'insurance', 'Employee Insurance Share', ${employeeInsuranceShare})`;
        }
        if (subscriptionDeduction > 0) {
          await tx`INSERT INTO pay_stub_items (pay_stub_id, type, category, description, amount) VALUES (${stub.id}, 'deduction', 'subscription', ${user.subscription}, ${subscriptionDeduction})`;
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

export async function exportCompanyPayrollExcel() {
  if (!(await verifyAdminAction()))
    return { success: false, error: "Unauthorized" };

  try {
    const records = await db`
      SELECT 
        u.name, u.branch, u.job_title, u.personal_phone, u.public_org, u.insurance, u.subscription,
        p.pay_period_start, p.pay_date, p.gross_pay, p.net_pay
      FROM pay_stubs p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.branch ASC, u.name ASC
    `;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Company Payroll", {
      views: [{ state: "frozen", ySplit: 1 }],  
    });
  
    sheet.columns = [
      { header: "Branch", key: "branch", width: 18 },
      { header: "Employee Name", key: "name", width: 25 },
      { header: "Job Title", key: "jobTitle", width: 22 },
      { header: "Phone Number", key: "phone", width: 18 },
      { header: "Pay Period", key: "period", width: 15 },
      { header: "Pay Date", key: "date", width: 15 },
      { header: "Public Employee", key: "isPublic", width: 16 },
      { header: "Basic Salary (Gross)", key: "gross", width: 20 },
      { header: "Tax (5% > 1M)", key: "tax", width: 16 },
      { header: "Total Insurance", key: "totalIns", width: 18 },
      { header: "Company Share", key: "companyShare", width: 18 },
      { header: "Employee Share", key: "employeeShare", width: 18 },
      { header: "Subscription", key: "subscription", width: 15 },
      { header: "Net Salary", key: "net", width: 20 },
    ];
 
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },  
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
        size: 12,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FFCBD5E1" } },
      };
    });

    sheet.autoFilter = 'A1:N1';
 
    records.forEach((r) => {
      const gross = Number(r.gross_pay);
      const tax = gross > 1000000 ? (gross - 1000000) * 0.05 : 0;

      const totalInsurance = r.insurance
        ? r.insurance.toLowerCase().includes("premium")
          ? 150000
          : 75000
        : 0;
      const employeeShare = totalInsurance * 0.5;
      const companyShare = totalInsurance * 0.5;

      const subDeduction = r.subscription ? 25000 : 0;

      const displayPeriod = new Date(r.pay_period_start).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" },
      );
      const displayDate = new Date(r.pay_date).toLocaleDateString("en-US");

      const row = sheet.addRow({
        branch: r.branch || "HQ",
        name: r.name,
        jobTitle: r.job_title || "N/A",
        phone: r.personal_phone || "N/A",
        period: displayPeriod,
        date: displayDate,
        isPublic: r.public_org ? "Yes" : "No",
        gross: gross,
        tax: tax,
        totalIns: totalInsurance,
        companyShare: companyShare,
        employeeShare: employeeShare,
        subscription: subDeduction,
        net: Number(r.net_pay)
      });
 
      const financialColumns = [8, 9, 10, 11, 12, 13, 14]; 
      financialColumns.forEach(col => {
        row.getCell(col).numFmt = '#,##0.00';
      });
    });
 
   const buffer = await workbook.xlsx.writeBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    
    const filename = `Payroll_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    return { success: true, excelBase64: base64String, filename };
  } catch (error) {
    console.error("Excel Export Error:", error);
    return { success: false, error: "Failed to generate Excel file." };
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

export async function markAllProcessingAsPaid() {
  if (!(await verifyAdminAction())) {
    return {
      success: false,
      message: "Unauthorized. Only HR Admins can process payments.",
    };
  }

  try {
    await db`UPDATE pay_stubs SET status = 'paid' WHERE status = 'processing'`;
    revalidatePath("/dashboard/payroll");
    return { success: true, message: "All processing payroll marked as paid." };
  } catch (error) {
    console.error("Bulk Payment Error:", error);
    return { success: false, message: "Failed to process bulk payments." };
  }
}
