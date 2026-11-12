import React from 'react';
import { DashboardStats, User } from '../types';
import { formatBytes } from '../utils/formatters';
import {
  HardDrive,
  ShieldCheck,
  FileCheck2,
  Users,
  FolderOpen,
  PieChart,
  CheckCircle,
  Lock,
} from 'lucide-react';

interface StatsViewProps {
  stats: DashboardStats | null;
  user: User;
  onOpenUpload: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  user,
  onOpenUpload,
}) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Vault Storage & Activity
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Detailed breakdown of your client portal storage, uploads, and security metrics.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          Upload New Assets
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Storage Used</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.totalBytesFormatted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            of 2.0 GB Free Tier ({stats.quotaPercentage}% full)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Total Files</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.totalFiles}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across all project portals
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Client Uploads</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.clientUploads}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Uploaded by clients via portal links
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Active Portals</span>
            <FolderOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.portalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dedicated project drop links
          </div>
        </div>
      </div>

      {/* Category Breakdown & Security Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>Files by Format & Category</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Images & Photos</span>
                <span className="font-mono tabular-nums text-slate-500">{stats.categoryBreakdown.image} files</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.categoryBreakdown.image / (stats.totalFiles || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Design & Vectors (.ai, .svg, .psd)</span>
                <span className="font-mono tabular-nums text-slate-500">{stats.categoryBreakdown.design} files</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.categoryBreakdown.design / (stats.totalFiles || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Documents & PDFs</span>
                <span className="font-mono tabular-nums text-slate-500">{stats.categoryBreakdown.document} files</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.categoryBreakdown.document / (stats.totalFiles || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Compressed Archives (.zip, .rar)</span>
                <span className="font-mono tabular-nums text-slate-500">{stats.categoryBreakdown.archive} files</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.categoryBreakdown.archive / (stats.totalFiles || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Vault Security & Isolation Protocol</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Per-User Data Isolation</strong>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Every user account possesses an isolated vault namespace. Only your verified session can retrieve, modify, or delete your files.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Cryptographic Password Protection</strong>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  User authentication utilizes high-iteration Scrypt key derivation with unique 16-byte random salts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Scoped Client Upload Portals</strong>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Public client upload links are scoped strictly to the designated project folder without exposing your full workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
