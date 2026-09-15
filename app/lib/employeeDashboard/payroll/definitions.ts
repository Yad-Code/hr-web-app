// app/lib/employeeDashboard/payroll/definitions.ts

export type PayStatus = "paid" | "processing" | "scheduled" | "on_hold";

export type PayItemType = "earning" | "deduction";

export type PayStubItem = {
  id: string;
  type: PayItemType;
  category: string;
  description?: string;
  amount: number;
};

export type PayStub = {
  id: string;
  user_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  net_pay: number;  
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
  account_number_masked: string; 
  routing_or_iban: string;
  is_primary: boolean;
  status: "verified" | "pending";
};
 
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
  file_url: string;
};

// Alias to avoid breaking imports elsewhere during refactoring
export type PayrollDocument = Document;
