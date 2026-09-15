// app/(employee)/my-profile/payroll/page.tsx
import PayrollDashboard, {
  PayrollDashboardData,
} from "@/app/ui/employee/payroll/payroll-dashboard";
import {
  fetchEmployeePayStubs,
  fetchPayStubItems,
  fetchEmployeePaymentMethods,
  fetchPayrollDocuments,
} from "@/app/lib/admin/payroll/data";
import { addPaymentMethod } from "@/app/lib/employee/payroll/data";
import { getCurrentUserId } from "@/app/lib/employeeDashboard/performance/actions/utils";

export default async function Page() {
  const userId = await getCurrentUserId();

  const handleAddAccount = addPaymentMethod.bind(null, userId);

  const rawStubs = await fetchEmployeePayStubs(userId);
  const rawMethods = await fetchEmployeePaymentMethods(userId);
  const rawDocs = await fetchPayrollDocuments(userId);

  const documents = rawDocs.map((doc) => ({
    id: doc.id,
    title: doc.file_name,
    year: new Date(doc.created_at).getFullYear().toString(),
    type: doc.document_type,
    issued_date: new Date(doc.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    file_size: doc.file_extension.toUpperCase(),
    file_url: doc.file_url,
  }));

  const stubsWithItems = await Promise.all(
    rawStubs.map(async (stub) => {
      const items = await fetchPayStubItems(stub.id);

      return {
        id: stub.id,
        user_id: stub.user_id,
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
        status: stub.status,
        items: items.map((item) => ({
          id: item.id,
          type: item.type,
          category: item.category,
          description: item.description || undefined,
          amount: Number(item.amount),
        })),
      };
    }),
  );

  const paymentMethods = rawMethods.map((pm) => ({
    id: pm.id,
    bank_name: pm.bank_name,
    account_holder: pm.account_holder,
    account_number_masked: pm.account_number_masked,
    routing_or_iban: pm.routing_or_iban || "N/A",
    is_primary: pm.is_primary,
    status: pm.status || "verified",
  }));

  const currentYear = new Date().getFullYear();
  const ytd_net = stubsWithItems
    .filter(
      (s) => s.status === "paid" && s.pay_date.includes(currentYear.toString()),
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

  const livePayrollData: PayrollDashboardData = {
    summary: {
      annual_net: monthly_base * 12,
      monthly_base: monthly_base,
      pay_frequency: "Monthly",
      next_pay_date: nextPayDate,
      currency: "USD",
      ytd_net: ytd_net,
    },
    payStubs: stubsWithItems,
    paymentMethods: paymentMethods,
    documents: documents,
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <PayrollDashboard
        initialData={livePayrollData}
        onAddAccount={handleAddAccount}
      />
    </main>
  );
}
