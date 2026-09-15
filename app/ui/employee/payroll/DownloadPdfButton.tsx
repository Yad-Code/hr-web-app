"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { PayStubItem } from "@/app/lib/employeeDashboard/payroll/definitions";

interface PdfButtonProps {
  payStub: {
    employee_name?: string;
    department?: string;
    pay_period_start: string | Date;
    pay_period_end: string | Date;
    pay_date: string | Date;
    account_number_masked?: string;
    net_pay: number | string;
  };
  earnings: PayStubItem[];
  deductions: PayStubItem[];
}

export function DownloadPdfButton({
  payStub,
  earnings,
  deductions,
}: PdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const formatCurrency = (amount: number | string) =>
        `$${Number(amount).toFixed(2)}`;

      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text("Salary Statement", 14, 22);
 
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);

      const periodStart = new Date(
        payStub.pay_period_start,
      ).toLocaleDateString();
      const periodEnd = new Date(payStub.pay_period_end).toLocaleDateString();
      const payDate = new Date(payStub.pay_date).toLocaleDateString();

      doc.text(`Employee: ${payStub.employee_name || "N/A"}`, 14, 35);
      doc.text(`Department: ${payStub.department || "N/A"}`, 14, 42);

      doc.text(`Pay Period: ${periodStart} - ${periodEnd}`, 120, 35);
      doc.text(`Pay Date: ${payDate}`, 120, 42);
      doc.text(
        `Deposit Account: ...${payStub.account_number_masked?.slice(-4) || "Manual"}`,
        120,
        49,
      );

      autoTable(doc, {
        startY: 60,
        head: [["Earnings", "Description", "Amount"]],
        body: earnings.map((e) => [
          e.category,
          e.description || "-",
          formatCurrency(e.amount),
        ]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
      });
 
      const finalYAfterEarnings = (
        doc as jsPDF & { lastAutoTable: { finalY: number } }
      ).lastAutoTable.finalY;

      autoTable(doc, {
        startY: finalYAfterEarnings + 10,
        head: [["Taxes & Deductions", "Description", "Amount"]],
        body: deductions.map((d) => [
          d.category,
          d.description || "-",
          `-${formatCurrency(d.amount)}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [225, 29, 72] },
        styles: { fontSize: 10 },
      });
 
      const finalYAfterDeductions = (
        doc as jsPDF & { lastAutoTable: { finalY: number } }
      ).lastAutoTable.finalY;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text(`Total Net Pay:`, 14, finalYAfterDeductions + 20);

      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text(
        `${formatCurrency(payStub.net_pay)}`,
        55,
        finalYAfterDeductions + 20,
      );

      const safeName = payStub.employee_name || "Employee";
      const filename = `Payslip_${safeName.replace(/\s+/g, "_")}_${periodStart.replace(/\//g, "-")}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {isGenerating ? "Generating..." : "Download PDF"}
      </span>
    </button>
  );
}
