import React, { useState } from 'react';
import { ClientPortal } from '../types';
import { api } from '../services/api';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  FolderLock,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

interface ClientPortalsViewProps {
  portals: ClientPortal[];
  onCreatePortalClick: () => void;
  onOpenPublicPortal: (code: string) => void;
}

export const ClientPortalsView: React.FC<ClientPortalsViewProps> = ({
  portals,
  onCreatePortalClick,
  onOpenPublicPortal,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/#portal=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Client File Portals
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Create branded, secure upload links for your clients. They can drop large files, brand assets, and briefs without needing a complex account.
          </p>
        </div>
        <button
          onClick={onCreatePortalClick}
          className="flex items-center gap-1.5 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Portal Link</span>
        </button>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portals.map((portal) => (
          <div
            key={portal.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {portal.code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Created {formatDate(portal.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                    {portal.projectName}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyLink(portal.code)}
                    title="Copy client share link"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  >
                    {copiedCode === portal.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onOpenPublicPortal(portal.code)}
                    title="Preview client view"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-800">{portal.clientName}</span>
                {portal.clientEmail && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{portal.clientEmail}</span>
                  </>
                )}
              </div>

              {portal.description && (
                <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  {portal.description}
                </p>
              )}
            </div>

            {/* Portal Stats & Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                <span className="font-semibold text-slate-800">{portal.fileCount ?? 0}</span> files
                <span className="mx-1 text-slate-300">·</span>
                <span>{formatBytes(portal.totalSize ?? 0)}</span>
              </div>

              <button
                onClick={() => onOpenPublicPortal(portal.code)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Client View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
