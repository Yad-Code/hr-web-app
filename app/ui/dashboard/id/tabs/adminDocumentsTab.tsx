// @/app/ui/dashboard/id/adminDocumentsTab.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmployeeDocument } from "@/app/lib/employee/definitions";
import { AdminHeader } from "./document/adminHeader";
import { UploadDocumentForm } from "./document/uploadDocumentForm";
import { DocumentArchive } from "./document/documentArchive";
import { DeleteConfirmationModal } from "./document/deleteConfirmationModal";
import {
  addDocumentAction,
  deleteDocumentAction,
} from "@/app/lib/employeeList/actions";

interface AdminDocumentsTabProps {
  documents?: EmployeeDocument[];
  userId: string;
}

export default function AdminDocumentsTab({
  documents = [],
  userId,
}: AdminDocumentsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddDocument = (newDoc: {
    title: string;
    category: string;
    file_url: string;
  }) => {
    startTransition(async () => {
      try {
        await addDocumentAction(userId, newDoc);
        router.refresh();
      } catch (err) {
        console.error("Failed to add document:", err);
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
        await deleteDocumentAction(id, userId);
        router.refresh();
      } catch (err) {
        console.error("Failed to delete document:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader title="Admin Documents Management" />
      <UploadDocumentForm onSubmit={handleAddDocument} isPending={isPending} />
      <DocumentArchive
        documents={documents}
        deletingId={deletingId}
        onDeleteClick={(id) => setItemToDelete(id)}
      />
      {itemToDelete && (
        <DeleteConfirmationModal
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
