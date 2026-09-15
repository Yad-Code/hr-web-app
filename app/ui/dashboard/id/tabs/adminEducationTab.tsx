"use client";

import React, { useState, useTransition } from "react";
import { EducationTabProps } from "@/app/lib/employee/definitions";
import {
  addEducationAction,
  deleteEducationAction,
  updateEducationDocumentAction,
} from "@/app/lib/employee/profile/actions";

import { AdminHeader } from "./education/adminHeader";
import { AddEducationForm } from "./education/addEducationForm";
import { EducationTable } from "./education/educationTable";
import { EducationDetailsModal } from "./education/educationDetailsModal";
import { EditEducationDocumentModal } from "./education/editEducationDocumentModal";
import { DeleteEducationModal } from "./education/deleteEducationModal";

interface AdminEducationTabProps extends EducationTabProps {
  userId: string;
}

export default function AdminEducationTab({
  educationHistory = [],
  userId,
}: AdminEducationTabProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal states
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [docModalItem, setDocModalItem] = useState<{
    id: string;
    level: string;
    currentUrl?: string | null;
  } | null>(null);

  const [selectedItem, setSelectedItem] = useState<
    AdminEducationTabProps["educationHistory"][number] | null
  >(null);

  // 👇 FIX 1: Accept FormData directly so the physical file is preserved
  const handleAddEducation = (formData: FormData) => {
    startTransition(async () => {
      try {
        await addEducationAction(userId, formData);
      } catch (err) {
        console.error("Failed to add education entry:", err);
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
        await deleteEducationAction(id);
      } catch (err) {
        console.error("Failed to delete education entry:", err);
      } finally {
        setDeletingId(null);
      }
    });
  };

  // 👇 FIX 2: Accept FormData instead of a string URL
  const handleSaveDocument = (formData: FormData) => {
    if (!docModalItem) return;

    const targetId = docModalItem.id;
    setDocModalItem(null);

    startTransition(async () => {
      try {
        await updateEducationDocumentAction(targetId, formData);
      } catch (err) {
        console.error("Failed to update document URL:", err);
      }
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader />

      <AddEducationForm onSubmit={handleAddEducation} isPending={isPending} />

      <EducationTable
        educationHistory={educationHistory}
        deletingId={deletingId}
        onViewDetails={(item) => setSelectedItem(item)}
        onEditDocument={(item) =>
          setDocModalItem({
            id: item.id,
            level: item.level,
            currentUrl: item.document_url,
          })
        }
        onDeleteClick={(id) => setItemToDelete(id)}
      />

      {selectedItem && (
        <EducationDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {docModalItem && (
        <EditEducationDocumentModal
          docModalItem={docModalItem}
          onClose={() => setDocModalItem(null)}
          onSave={handleSaveDocument}
        />
      )}

      {itemToDelete && (
        <DeleteEducationModal
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
