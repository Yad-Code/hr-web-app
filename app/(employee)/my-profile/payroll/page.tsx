// app/payroll/page.tsx
import PayrollDashboard, {
  PayrollDashboardData,
} from "@/app/ui/employee/payroll/payroll-dashboard";

// Mock Data updated to align with the strictly earnings model
const mockPayrollData: PayrollDashboardData = {
  summary: {
    annual_net: 71040, // Net yearly take-home
    monthly_base: 5920,
    pay_frequency: "Monthly",
    next_pay_date: "Aug 31, 2026",
    currency: "USD",
    ytd_net: 41440,
  },
  payStubs: [
    {
      id: "stub-001",
      user_id: "user-123",
      pay_period_start: "Jul 1, 2026",
      pay_period_end: "Jul 31, 2026",
      pay_date: "Jul 31, 2026",
      net_pay: 5920,
      status: "paid",
      items: [
        {
          id: "i1",
          type: "earning",
          category: "Base Pay",
          amount: 5420,
        },
        {
          id: "i2",
          type: "earning",
          category: "Performance Bonus",
          description: "Q2 Bonus",
          amount: 500,
        },
      ],
    },
    {
      id: "stub-002",
      user_id: "user-123",
      pay_period_start: "Jun 1, 2026",
      pay_period_end: "Jun 30, 2026",
      pay_date: "Jun 30, 2026",
      net_pay: 5920,
      status: "paid",
      items: [
        {
          id: "i6",
          type: "earning",
          category: "Base Pay",
          amount: 5920,
        },
      ],
    },
  ],
  paymentMethods: [
    {
      id: "pm-1",
      bank_name: "JPMorgan Chase",
      account_holder: "Yad Hassan",
      account_number_masked: "•••• 8821",
      routing_or_iban: "021000021",
      is_primary: true,
      status: "verified",
    },
  ],
  documents: [
    {
      id: "doc-1",
      title: "2025 Annual Income Statement",
      year: "2025",
      type: "Annual Statement",
      issued_date: "Jan 15, 2026",
      file_size: "1.2 MB",
    },
    {
      id: "doc-2",
      title: "Employment & Salary Verification",
      year: "2026",
      type: "Employment Verification",
      issued_date: "Feb 01, 2026",
      file_size: "450 KB",
    },
  ],
};

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <PayrollDashboard initialData={mockPayrollData} />
    </main>
  );
}
