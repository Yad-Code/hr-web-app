// app/payroll/page.tsx
import PayrollDashboard, {
  PayrollDashboardData,
} from "@/app/ui/employee/payroll/payroll-dashboard";
import {
  fetchEmployeePayStubs,
  fetchPayStubItems,
  fetchEmployeePaymentMethods,
} from "@/app/lib/admin/payroll/data";
import { addPaymentMethod } from "@/app/lib/employee/payroll/data";
import { getCurrentUserId } from "@/app/lib/employeeDashboard/performance/actions/utils";

export default async function Page() {
  // 1. Get the current logged-in user
  const userId = await getCurrentUserId();

  // Bind the userId so the form action receives it automatically
  const handleAddAccount = addPaymentMethod.bind(null, userId);

  // 2. Fetch raw database records
  const rawStubs = await fetchEmployeePayStubs(userId);
  const rawMethods = await fetchEmployeePaymentMethods(userId);

  // 3. Fetch line items for every pay stub concurrently
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

  // 4. Map payment methods to your interface
  const paymentMethods = rawMethods.map((pm) => ({
    id: pm.id,
    bank_name: pm.bank_name,
    account_holder: pm.account_holder,
    account_number_masked: pm.account_number_masked,
    routing_or_iban: pm.routing_or_iban || "N/A",
    is_primary: pm.is_primary,
    status: pm.status || "verified",
  }));

  // 5. Calculate the dynamic summary metrics
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
    documents: [
      {
        id: "doc-1",
        title: "2025 Annual Income Statement",
        year: "2025",
        type: "Annual Statement",
        issued_date: "Jan 15, 2026",
        file_size: "1.2 MB",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      {/* Pass the bound action down to the dashboard component */}
      <PayrollDashboard
        initialData={livePayrollData}
        onAddAccount={handleAddAccount}
      />
    </main>
  );
}
