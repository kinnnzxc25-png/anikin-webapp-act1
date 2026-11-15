import React, { useState } from 'react';
import { ClientPortal } from '../types';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  Copy,
  Check,
  ExternalLink,
  Plus,
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
      <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Private Drop Portals
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Generate dedicated external upload links for guests, partners, and collaborators to submit files directly into your Member Vault.
          </p>
        </div>
        <button
          onClick={onCreatePortalClick}
          className="flex items-center gap-1.5 py-2 px-4 bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Drop Link</span>
        </button>
      </div>

      {portals.length === 0 ? (
        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-10 text-center text-xs text-slate-400">
          No external drop portals created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className="bg-[#0A1120] rounded-2xl border border-slate-800 p-5 hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-[#E7C860]">
                        {portal.code}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {formatDate(portal.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 truncate">
                      {portal.projectName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(portal.code)}
                      title="Copy share link"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedCode === portal.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenPublicPortal(portal.code)}
                      title="Open portal"
                      className="p-1.5 text-slate-400 hover:text-[#E7C860] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="font-medium text-white">{portal.clientName}</span>
                  {portal.clientEmail && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">{portal.clientEmail}</span>
                    </>
                  )}
                </div>

                {portal.description && (
                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed bg-[#060911] p-2.5 rounded-xl border border-slate-800">
                    {portal.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono tabular-nums">
                  <span className="font-semibold text-white">{portal.fileCount ?? 0}</span> files
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span>{formatBytes(portal.totalSize ?? 0)}</span>
                </div>

                <button
                  onClick={() => onOpenPublicPortal(portal.code)}
                  className="text-xs font-semibold text-[#E7C860] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
