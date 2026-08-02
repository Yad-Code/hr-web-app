// @/app/lib/admin/payroll/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";

export type AdminPayrollRecord = {
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

export async function fetchAllPayStubs(): Promise<AdminPayrollRecord[]> {
  try {
    const records = await db<AdminPayrollRecord[]>`
      SELECT 
        p.id,
        p.user_id,
        p.pay_period_start,
        p.pay_period_end,
        p.pay_date,
        p.gross_pay,
        p.net_pay,
        p.status,
        u.name as employee_name,
        u.email as employee_email,
        u.image_url
      FROM pay_stubs p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.pay_date DESC, u.name ASC
    `;

    return records;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch payroll records.");
  }
}

export async function fetchPayStubDetails(id: string) {
  const [record] = await db`
    SELECT p.*, u.name as employee_name, u.email, u.department,
           pm.id as payment_method_id,
           pm.bank_name, 
           pm.account_number_masked,
           pm.status as payment_status
    FROM pay_stubs p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN payment_methods pm ON u.id = pm.user_id AND pm.is_primary = true
    WHERE p.id = ${id}
  `;
  return record;
}

export async function fetchPayStubItems(payStubId: string) {
  const items = await db`
    SELECT * FROM pay_stub_items 
    WHERE pay_stub_id = ${payStubId} 
    ORDER BY type DESC, amount DESC
  `;
  return items;
}

// For the Employee view later
export async function fetchEmployeePayStubs(userId: string) {
  const records = await db`
    SELECT * FROM pay_stubs 
    WHERE user_id = ${userId} 
    ORDER BY pay_date DESC
  `;
  return records;
}

export async function fetchEmployeePaymentMethods(userId: string) {
  try {
    const methods = await db`
      SELECT pm.*, u.name as account_holder 
      FROM payment_methods pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.user_id = ${userId}
    `;
    return methods;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch payment methods.");
  }
}
