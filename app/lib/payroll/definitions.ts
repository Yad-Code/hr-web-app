// app/lib/payroll/definitions.ts

export type PayStatus = "paid" | "processing" | "scheduled" | "on_hold";

// Strictly earnings now
export type PayItemType = "earning";

export type PayStubItem = {
  id: string;
  type: PayItemType;
  category: string; // 'Base Salary', 'Performance Bonus', 'Overtime', etc.
  description?: string;
  amount: number;
};

export type PayStub = {
  id: string;
  user_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  net_pay: number; // Primary payout amount
  status: PayStatus;
  pdf_url?: string;
  items: PayStubItem[];
};

export type CompensationSummary = {
  annual_net: number;
  monthly_base: number;
  pay_frequency: "Monthly" | "Bi-Weekly" | "Weekly";
  next_pay_date: string;
  currency: string;
  ytd_net: number;
};

export type PaymentMethod = {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number_masked: string; // e.g. "•••• 4321"
  routing_or_iban: string;
  is_primary: boolean;
  status: "verified" | "pending";
};

// Rebranded general company/payroll document type
export type Document = {
  id: string;
  title: string;
  year: string;
  type:
    | "Annual Statement"
    | "Employment Verification"
    | "Compensation Letter"
    | "Policy Agreement";
  issued_date: string;
  file_size: string;
};

// Alias to avoid breaking imports elsewhere during refactoring
export type PayrollDocument = Document;
