import React from 'react';
import { DashboardStats, User } from '../types';
import {
  HardDrive,
  ShieldCheck,
  FileCheck2,
  Users,
  FolderOpen,
  PieChart,
  CheckCircle,
} from 'lucide-react';

interface StatsViewProps {
  stats: DashboardStats | null;
  user: User;
  onOpenUpload: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  onOpenUpload,
}) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Vault Storage & Security
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Storage allocation, format distribution, and isolation safeguards for your Member Vault.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="py-2 px-4 bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
        >
          Upload New Assets
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Storage Used</span>
            <HardDrive className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.totalBytesFormatted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            of 2.0 GB Allowance ({stats.quotaPercentage}% full)
          </div>
        </div>

        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Files</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.totalFiles}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across vault & drop portals
          </div>
        </div>

        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">External Drops</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.clientUploads}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Submitted via drop links
          </div>
        </div>

        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Drop Portals</span>
            <FolderOpen className="w-4 h-4 text-[#E7C860]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.portalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dedicated upload folders
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#D4AF37]" />
            <span>Files by Format & Category</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Images & Photos', count: stats.categoryBreakdown.image, bar: 'bg-emerald-400' },
              { label: 'Design & Vectors (.ai, .svg, .psd)', count: stats.categoryBreakdown.design, bar: 'bg-purple-400' },
              { label: 'Documents & PDFs', count: stats.categoryBreakdown.document, bar: 'bg-[#D4AF37]' },
              { label: 'Compressed Archives (.zip, .rar)', count: stats.categoryBreakdown.archive, bar: 'bg-amber-400' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{row.label}</span>
                  <span className="font-mono tabular-nums text-slate-400">{row.count} files</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.bar} rounded-full`}
                    style={{ width: `${Math.min(100, (row.count / (stats.totalFiles || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Vault Security Protocol</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Per-Member Data Isolation</strong>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  Every member account maintains an isolated vault namespace. Only your verified session can retrieve or delete your assets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Cryptographic Key Derivation</strong>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  Member credentials are protected with Scrypt hashing and unique 16-byte salts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Scoped External Drop Links</strong>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  Shared drop portals accept collaborator submissions without exposing your full member workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
