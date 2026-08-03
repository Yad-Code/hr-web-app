import React from "react";
import { Eye, ExternalLink, FilePlus, Loader2, Trash2 } from "lucide-react";
import { EducationTabProps } from "@/app/lib/employee/definitions";

type EducationItem = EducationTabProps["educationHistory"][number];

export function EducationTable({
  educationHistory,
  deletingId,
  onViewDetails,
  onEditDocument,
  onDeleteClick,
}: {
  educationHistory: EducationItem[];
  deletingId: string | null;
  onViewDetails: (item: EducationItem) => void;
  onEditDocument: (item: EducationItem) => void;
  onDeleteClick: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 overflow-hidden">
      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
        Education History Log
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 rounded-lg">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">
                Education Level
              </th>
              <th className="px-4 py-3 font-semibold">Academic Subject</th>
              <th className="px-4 py-3 font-semibold">Institution</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {educationHistory.map((edu) => (
              <tr
                key={edu.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {edu.level}
                </td>
                <td className="px-4 py-3 text-slate-600">{edu.subject}</td>
                <td className="px-4 py-3 text-slate-600 font-medium">
                  {edu.institution}
                </td>
                <td className="px-4 py-3 text-slate-600">{edu.location}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetails(edu)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {edu.document_url && (
                      <a
                        href={edu.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="View Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditDocument(edu)}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        edu.document_url
                          ? "text-indigo-600 hover:bg-indigo-50"
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                      title={
                        edu.document_url ? "Update Document" : "Add Document"
                      }
                    >
                      <FilePlus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteClick(edu.id)}
                      disabled={deletingId === edu.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      {deletingId === edu.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {educationHistory.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-xs font-semibold text-slate-400"
                >
                  No education history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
