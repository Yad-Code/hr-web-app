import React from "react";
import {
  Languages,
  X,
  Volume2,
  BookOpen,
  PenTool,
  MessageSquare,
  FileText,
  ExternalLink,
} from "lucide-react";
import { LanguageEntry } from "./types";
import { ProficiencyBadge } from "./formFields";

export function LanguageDetailsModal({
  item,
  onClose,
}: {
  item: LanguageEntry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {item.language}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Recorded by: {item.created_by}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Listening
              </span>
              <div>
                <ProficiencyBadge level={item.listening} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Reading
              </span>
              <div>
                <ProficiencyBadge level={item.reading} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-slate-400" />
                Writing
              </span>
              <div>
                <ProficiencyBadge level={item.writing} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Speaking
              </span>
              <div>
                <ProficiencyBadge level={item.speaking} />
              </div>
            </div>
          </div>

          {item.document_url ? (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs text-slate-600 truncate font-mono">
                  {item.document_url}
                </span>
              </div>
              <a
                href={item.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0 ml-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Link
              </a>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-center text-xs text-slate-400">
              No document/certificate attached
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
