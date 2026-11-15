import React from 'react';
import { User, Announcement, DashboardStats } from '../types';
import { DashboardTab } from './Sidebar';
import { formatDate } from '../utils/formatters';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Users,
  Megaphone,
  FolderLock,
  UserCircle,
  Shield,
  ArrowRight,
  Pin,
  Calendar,
  MapPin,
} from 'lucide-react';

interface MemberOverviewProps {
  user: User;
  announcements: Announcement[];
  directoryCount: number;
  stats: DashboardStats | null;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const MemberOverview: React.FC<MemberOverviewProps> = ({
  user,
  announcements,
  directoryCount,
  stats,
  onNavigateTab,
}) => {
  const pinnedOrRecent = [...announcements]
    .sort((a, b) => {
      if (a.priority === 'pinned' && b.priority !== 'pinned') return -1;
      if (a.priority !== 'pinned' && b.priority === 'pinned') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 3);

  const statusMeta =
    user.membershipStatus === 'active'
      ? {
          label: 'Active Standing',
          desc: 'Full reciprocal chapter access, directory visibility, and vault privileges.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          textClass: 'text-emerald-400',
          borderClass: 'border-emerald-500/30 bg-emerald-950/30',
        }
      : user.membershipStatus === 'pending'
      ? {
          label: 'Pending Committee Review',
          desc: 'Your application is queued with our chapter stewards. Once approved, full member privileges unlock automatically.',
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          textClass: 'text-amber-400',
          borderClass: 'border-amber-500/30 bg-amber-950/30',
        }
      : user.membershipStatus === 'alumni'
      ? {
          label: 'Alumni Member',
          desc: 'Former active fellow with archival vault and seasonal salon invitations.',
          icon: <ShieldCheck className="w-4 h-4 text-sky-400" />,
          textClass: 'text-sky-400',
          borderClass: 'border-sky-500/30 bg-sky-950/30',
        }
      : {
          label: 'Membership Suspended',
          desc: 'Please contact chapter administration regarding your current standing.',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          textClass: 'text-rose-400',
          borderClass: 'border-rose-500/30 bg-rose-950/30',
        };

  return (
    <div className="space-y-6">
      {/* Pending / Suspended Notice Banner */}
      {user.membershipStatus !== 'active' && (
        <div
          className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${statusMeta.borderClass}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{statusMeta.icon}</div>
            <div>
              <div className={`text-xs font-bold ${statusMeta.textClass}`}>
                Membership Status: {statusMeta.label}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {statusMeta.desc}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-[#0A1120] border border-slate-700 hover:border-[#D4AF37]/50 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Review Profile
          </button>
        </div>
      )}

      {/* Digital Membership Card + KPI Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Digital Membership Credential Card */}
        <div className="xl:col-span-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#0A1120] to-[#060911] border border-[#D4AF37]/35 p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-sm font-semibold tracking-[0.18em] text-[#E7C860]">
                BOY'S AT THE BACK
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Digital Member Credential
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {statusMeta.icon}
              <span className={statusMeta.textClass}>{statusMeta.label}</span>
            </div>
          </div>

          <div className="my-8">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Member Name
            </div>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1 truncate">
              {user.name}
            </div>
            <div className="text-xs text-slate-300 mt-1 truncate">
              {[user.title, user.company].filter(Boolean).join(' · ') || 'Fellowship Member'}
            </div>
          </div>

          <div className="pt-5 border-t border-[#D4AF37]/20 grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-[11px] text-slate-400">Member ID</div>
              <div className="font-mono font-semibold text-[#E7C860] tabular-nums mt-0.5">
                {user.memberNumber}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Tier</div>
              <div className="font-semibold text-white mt-0.5 truncate">
                {user.membershipTier}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Chapter</div>
              <div className="font-semibold text-white mt-0.5 truncate">
                {user.chapter || 'Manila'}
              </div>
            </div>
          </div>
        </div>

        {/* Summary KPIs & Quick Actions */}
        <div className="xl:col-span-7 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigateTab('directory')}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/40 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Directory</span>
                <Users className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                {directoryCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active Members</div>
            </button>

            <button
              onClick={() => onNavigateTab('announcements')}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/40 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Briefings</span>
                <Megaphone className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                {announcements.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">House Notices</div>
            </button>

            <button
              onClick={() => onNavigateTab('vault')}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/40 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Vault Files</span>
                <FolderLock className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                {stats?.totalFiles ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats?.totalBytesFormatted ?? '0 B'} Stored
              </div>
            </button>

            <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Member Since</span>
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="font-mono text-sm font-semibold text-white tabular-nums mt-1">
                {formatDate(user.joinedAt || user.createdAt)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {user.chapter || 'Manila'} House
              </div>
            </div>
          </div>

          {/* Quick Navigation Strip */}
          <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-semibold text-white mb-3">
              Member Shortcuts
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigateTab('directory')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Browse Member Directory</span>
              </button>

              <button
                onClick={() => onNavigateTab('profile')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060911] border border-slate-700 hover:border-[#D4AF37]/60 text-slate-200 hover:text-[#E7C860] text-xs font-semibold transition-colors cursor-pointer"
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span>Update Profile</span>
              </button>

              <button
                onClick={() => onNavigateTab('vault')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060911] border border-slate-700 hover:border-[#D4AF37]/60 text-slate-200 hover:text-[#E7C860] text-xs font-semibold transition-colors cursor-pointer"
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Open Member Vault</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigateTab('admin')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060911] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-[#E7C860] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Open Admin Console</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Announcements Preview */}
      <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">House Announcements & Salons</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pinned dispatches and upcoming chapter gatherings.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('announcements')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7C860] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <span>All Announcements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pinnedOrRecent.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No announcements published yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {pinnedOrRecent.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {item.priority === 'pinned' && (
                      <span className="inline-flex items-center gap-1 text-[#E7C860] font-semibold">
                        <Pin className="w-3 h-3" />
                        Pinned
                      </span>
                    )}
                    {item.priority === 'pinned' && <span className="text-slate-600">·</span>}
                    <span className="font-semibold text-[#D4AF37]">{item.category}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {formatDate(item.publishedAt)}
                    </span>
                    {item.location && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {item.content}
                  </p>
                </div>

                {item.eventDate && (
                  <div className="shrink-0 text-left sm:text-right">
                    <div className="text-[11px] text-slate-400">Event Date</div>
                    <div className="text-xs font-mono text-[#E7C860] tabular-nums mt-0.5">
                      {formatDate(item.eventDate)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
