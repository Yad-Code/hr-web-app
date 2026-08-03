"use client";

import React, { useState, useTransition } from "react";
import { LanguageEntry } from "./language/types";
import { AdminHeader } from "./language/adminHeader";
import { EmployeeInfoCard } from "./language/employeeInfoCard";
import { AddLanguageForm } from "./language/addLanguageForm";
import { LanguageTable } from "./language/languageTable";
import { LanguageDetailsModal } from "./language/languageDetailsModal";
import { EditCertificateModal } from "./language/editCertificateModal";
import { DeleteLanguageModal } from "./language/deleteLanguageModal";

interface AdminLanguageTabProps {
  languageHistory: LanguageEntry[];
  userId: string;
  employeeId?: string | null;
  employeeName?: string;
}

export default function AdminLanguageTab({
  languageHistory = [],
  userId,
  employeeId = "N/A",
  employeeName = "Employee",
}: AdminLanguageTabProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal States
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [docModalItem, setDocModalItem] = useState<{
    id: string;
    language: string;
    currentUrl?: string | null;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<LanguageEntry | null>(null);

  const handleAddLanguage = (formData: Record<string, string>) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    startTransition(async () => {
      try {
        const { addLanguageAction } =
          await import("@/app/lib/employee/profile/actions");
        await addLanguageAction(userId, employeeName ?? "Admin", data);
      } catch (err) {
        console.error("Failed to add language entry:", err);
      }
    });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    const id = itemToDelete;
    setItemToDelete(null);
    setDeletingId(id);

    startTransition(async () => {
      try {
        const { deleteLanguageAction } =
          await import("@/app/lib/employee/profile/actions");
        await deleteLanguageAction(id);
      } catch (err) {
        console.error("Failed to delete language entry:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleSaveDocument = (urlToSave: string | null) => {
    if (!docModalItem) return;

    const targetId = docModalItem.id;
    setDocModalItem(null);

    startTransition(async () => {
      try {
        const { updateLanguageDocumentAction } =
          await import("@/app/lib/employee/profile/actions");
        await updateLanguageDocumentAction(targetId, urlToSave);
      } catch (err) {
        console.error("Failed to update document URL:", err);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader title="Admin Language Record Management" />

      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
        <EmployeeInfoCard employeeId={employeeId} employeeName={employeeName} />
        <AddLanguageForm onSubmit={handleAddLanguage} isPending={isPending} />
      </div>

      <LanguageTable
        languageHistory={languageHistory}
        deletingId={deletingId}
        onViewDetails={(item) => setSelectedItem(item)}
        onEditCertificate={(item) =>
          setDocModalItem({
            id: item.id,
            language: item.language,
            currentUrl: item.document_url,
          })
        }
        onDeleteClick={(id) => setItemToDelete(id)}
      />

      {selectedItem && (
        <LanguageDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {docModalItem && (
        <EditCertificateModal
          docModalItem={docModalItem}
          onClose={() => setDocModalItem(null)}
          onSave={handleSaveDocument}
        />
      )}

      {itemToDelete && (
        <DeleteLanguageModal
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
