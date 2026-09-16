"use client";

import { useState } from "react";
import { exportCompanyPayrollExcel } from "@/app/lib/admin/payroll/actions";
import {  Loader2, FileSpreadsheet } from "lucide-react";

export function ExportPayrollButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportCompanyPayrollExcel();

      if (res.success && res.excelBase64) { 
        const byteCharacters = atob(res.excelBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
 
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = res.filename || "payroll_export.xlsx";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        alert(res.error || "Export failed");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-xs disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
      )}
      Export Excel
    </button>
  );
}
