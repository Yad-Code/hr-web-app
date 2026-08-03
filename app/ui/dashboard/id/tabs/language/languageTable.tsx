import React from "react";
import { Eye, ExternalLink, FilePlus, Loader2, Trash2 } from "lucide-react";
import { LanguageEntry } from "./types";
import { ProficiencyBadge } from "./formFields";

export function LanguageTable({
  languageHistory,
  deletingId,
  onViewDetails,
  onEditCertificate,
  onDeleteClick,
}: {
  languageHistory: LanguageEntry[];
  deletingId: string | null;
  onViewDetails: (item: LanguageEntry) => void;
  onEditCertificate: (item: LanguageEntry) => void;
  onDeleteClick: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 overflow-hidden">
      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
        Recorded Language Competencies
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 rounded-lg">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg text-center">
                Actions
              </th>
              <th className="px-4 py-3 font-semibold">Language</th>
              <th className="px-4 py-3 font-semibold">Speaking</th>
              <th className="px-4 py-3 font-semibold">Reading</th>
              <th className="px-4 py-3 font-semibold">Writing</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">
                Added By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {languageHistory.map((lang) => (
              <tr
                key={lang.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetails(lang)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {lang.document_url && (
                      <a
                        href={lang.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="View Certificate"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditCertificate(lang)}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        lang.document_url
                          ? "text-indigo-600 hover:bg-indigo-50"
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                      title={
                        lang.document_url
                          ? "Edit Certificate Link"
                          : "Attach Certificate Link"
                      }
                    >
                      <FilePlus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteClick(lang.id)}
                      disabled={deletingId === lang.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                      title="Remove Entry"
                    >
                      {deletingId === lang.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {lang.language}
                </td>
                <td className="px-4 py-3">
                  <ProficiencyBadge level={lang.speaking} />
                </td>
                <td className="px-4 py-3">
                  <ProficiencyBadge level={lang.reading} />
                </td>
                <td className="px-4 py-3">
                  <ProficiencyBadge level={lang.writing} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                  {lang.created_by}
                </td>
              </tr>
            ))}

            {languageHistory.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-xs font-semibold text-slate-400"
                >
                  No language records exist for this employee.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
