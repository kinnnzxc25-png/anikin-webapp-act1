import React from 'react';
import { User, DashboardStats } from '../types';
import {
  FolderOpen,
  Share2,
  HardDrive,
  LogOut,
  Sparkles,
  ExternalLink,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: 'files' | 'portals' | 'storage';
  setActiveTab: (tab: 'files' | 'portals' | 'storage') => void;
  stats: DashboardStats | null;
  onSignOut: () => void;
  onOpenUpload: () => void;
  onOpenCreatePortal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  stats,
  onSignOut,
  onOpenUpload,
  onOpenCreatePortal,
}) => {
  const percentage = stats ? parseFloat(stats.quotaPercentage) : 1.2;

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 flex flex-col shrink-0 h-screen border-r border-[#15233e] select-none">
      {/* Top Brand Zone */}
      <div className="p-5 border-b border-[#182643] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7h-7" />
              <path d="M14 17H5" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight leading-none">
              TamBuys
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Client File Portal</div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <button
          onClick={() => setActiveTab('files')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'files'
              ? 'bg-slate-800/90 text-white shadow-inner font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderOpen className={`w-4 h-4 ${activeTab === 'files' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Files & Assets</span>
          </div>
          {stats && (
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 tabular-nums">
              {stats.totalFiles}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('portals')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'portals'
              ? 'bg-slate-800/90 text-white shadow-inner font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Share2 className={`w-4 h-4 ${activeTab === 'portals' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Client Portals</span>
          </div>
          {stats && (
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 tabular-nums">
              {stats.portalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'storage'
              ? 'bg-slate-800/90 text-white shadow-inner font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HardDrive className={`w-4 h-4 ${activeTab === 'storage' ? 'text-blue-400' : 'text-slate-400'}`} />
          <span>Storage & Activity</span>
        </button>

        {/* Quick Portal Creator for Freelancers */}
        {user.role === 'freelancer' && (
          <div className="pt-4 px-1">
            <div className="p-3 rounded-xl bg-[#101b33] border border-[#1b2b4f]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Client Drop Link</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                Create a secure upload link for a client project.
              </p>
              <button
                onClick={onOpenCreatePortal}
                className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+ New Portal Link</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Storage Quota Usage Meter */}
      <div className="p-4 mx-3 mb-3 bg-[#101b33] border border-[#182643] rounded-xl">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-300 font-medium">Vault Storage</span>
          <span className="font-mono text-slate-400 text-[11px] tabular-nums">
            {stats ? stats.totalBytesFormatted : '41.8 MB'} / 2.0 GB
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(percentage, 3)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <FileCheck2 className="w-3 h-3 text-emerald-400" />
            Active Vault
          </span>
          <span className="tabular-nums font-mono">{percentage}% used</span>
        </div>
      </div>

      {/* User Profile Card & Sign Out */}
      <div className="p-3 border-t border-[#182643] bg-[#091122]">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs ring-1 ring-slate-700">
              {user.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate leading-tight">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {user.company || (user.role === 'freelancer' ? 'Freelance Studio' : 'Client')}
            </div>
          </div>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
