// @/app/lib/employee/payroll/data.ts
import { sql as db } from "@/app/lib/employeeDashboard/employee/db";
import { auth } from "@/auth";
import {
  PayrollDashboardData,
  Document,
  PayStatus,
  PayItemType,
  PaymentMethod,
} from "./definitions";

export async function getEmployeePayrollData(): Promise<PayrollDashboardData | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    const [rawStubs, rawMethods, rawDocs] = await Promise.all([
      db`SELECT * FROM pay_stubs WHERE user_id = ${userId}::uuid ORDER BY pay_date DESC`,
      db`SELECT * FROM payment_methods WHERE user_id = ${userId}::uuid ORDER BY is_primary DESC, id DESC`,
      db`
        SELECT id, document_type, file_name, file_extension, file_url, created_at
        FROM employee_documents
        WHERE user_id = ${userId}::uuid 
        AND document_type IN ('Employment Contract', 'Tax Form', 'Compensation Letter', 'Policy Agreement')
        ORDER BY created_at DESC
      `,
    ]);

    const documents = rawDocs.map((doc) => ({
      id: String(doc.id),
      title: String(doc.file_name),
      year: new Date(doc.created_at).getFullYear().toString(),
      type: doc.document_type as Document["type"],
      issued_date: new Date(doc.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      file_size: String(doc.file_extension).toUpperCase(),
      file_url: String(doc.file_url),
    }));

    const stubsWithItems = await Promise.all(
      rawStubs.map(async (stub) => {
        const items =
          await db`SELECT * FROM pay_stub_items WHERE pay_stub_id = ${stub.id}::uuid ORDER BY type DESC, amount DESC`;
        return {
          id: String(stub.id),
          user_id: String(stub.user_id),
          pay_period_start: new Date(stub.pay_period_start).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" },
          ),
          pay_period_end: new Date(stub.pay_period_end).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" },
          ),
          pay_date: new Date(stub.pay_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          net_pay: Number(stub.net_pay),
          status: stub.status as PayStatus,
          items: items.map((item) => ({
            id: String(item.id),
            type: item.type as PayItemType,
            category: String(item.category),
            description: item.description
              ? String(item.description)
              : undefined,
            amount: Number(item.amount),
          })),
        };
      }),
    );

    const paymentMethods = rawMethods.map((pm) => ({
      id: String(pm.id),
      bank_name: String(pm.bank_name),
      account_holder: String(pm.account_holder),
      account_number_masked: String(pm.account_number_masked),
      routing_or_iban: pm.routing_or_iban ? String(pm.routing_or_iban) : "N/A",
      is_primary: Boolean(pm.is_primary),
      status: (pm.status as PaymentMethod["status"]) || "verified",
    }));

    const currentYear = new Date().getFullYear();
    const ytd_net = stubsWithItems
      .filter(
        (s) =>
          s.status === "paid" && s.pay_date.includes(currentYear.toString()),
      )
      .reduce((sum, stub) => sum + stub.net_pay, 0);

    const latestStub = stubsWithItems[0];
    const monthly_base = latestStub ? latestStub.net_pay : 0;
    const today = new Date();
    const nextPayDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      5,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      summary: {
        annual_net: monthly_base * 12,
        monthly_base: monthly_base,
        pay_frequency: "Monthly",
        next_pay_date: nextPayDate,
        currency: "USD",
        ytd_net: ytd_net,
      },
      payStubs: stubsWithItems,
      paymentMethods,
      documents,
    };
  } catch (error) {
    console.error("Failed to fetch payroll data:", error);
    return null;
  }
}
