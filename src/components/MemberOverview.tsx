import React from 'react';
import { User, Announcement, DashboardStats, MembershipApplication } from '../types';
import { DashboardTab } from './Sidebar';
import { MembershipStatusBadge } from './MembershipStatusBadge';
import { formatDate } from '../utils/formatters';
import {
  ShieldCheck,
  Clock,
  XCircle,
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
  Lock,
} from 'lucide-react';

interface MemberOverviewProps {
  user: User;
  application?: MembershipApplication | null;
  announcements: Announcement[];
  directoryCount: number;
  stats: DashboardStats | null;
  onNavigateTab: (tab: DashboardTab) => void;
}

export const MemberOverview: React.FC<MemberOverviewProps> = ({
  user,
  application,
  announcements,
  directoryCount,
  stats,
  onNavigateTab,
}) => {
  const hasExclusiveAccess = user.role === 'admin' || user.membershipStatus === 'active';

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
          label: 'Active',
          desc: 'Full reciprocal chapter access, member directory visibility, house dispatches, and Member Vault privileges.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          textClass: 'text-emerald-400',
          borderClass: 'border-emerald-500/30 bg-emerald-950/25',
        }
      : user.membershipStatus === 'pending'
      ? {
          label: 'Pending Committee Review',
          desc: 'Your approval-based membership application is queued with chapter stewards. Exclusive features (Directory, Announcements, Member Vault) unlock once an admin approves your application.',
          icon: <Clock className="w-4 h-4 text-amber-300" />,
          textClass: 'text-amber-300',
          borderClass: 'border-amber-500/35 bg-amber-950/30',
        }
      : user.membershipStatus === 'rejected'
      ? {
          label: 'Application Rejected',
          desc:
            application?.reviewNote ||
            'Your membership application was not approved by the admissions committee. Exclusive member sections remain restricted.',
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          textClass: 'text-rose-400',
          borderClass: 'border-rose-500/35 bg-rose-950/30',
        }
      : user.membershipStatus === 'alumni'
      ? {
          label: 'Alumni Member',
          desc: 'Former active fellow with archival record access.',
          icon: <ShieldCheck className="w-4 h-4 text-sky-400" />,
          textClass: 'text-sky-400',
          borderClass: 'border-sky-500/30 bg-sky-950/30',
        }
      : {
          label: 'Membership Suspended',
          desc: 'Please contact chapter administration regarding your current standing.',
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
          textClass: 'text-orange-400',
          borderClass: 'border-orange-500/30 bg-orange-950/30',
        };

  return (
    <div className="space-y-6">
      {/* Status Banner for Pending / Rejected / Suspended */}
      {!hasExclusiveAccess && (
        <div
          className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${statusMeta.borderClass}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{statusMeta.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold ${statusMeta.textClass}`}>
                  {statusMeta.label}
                </span>
                <MembershipStatusBadge status={user.membershipStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                {statusMeta.desc}
              </p>
              {application && user.membershipStatus === 'pending' && (
                <p className="text-[11px] font-mono text-slate-400 mt-1.5 tabular-nums">
                  Submitted {formatDate(application.submittedAt)} · Requested Tier: {application.tierRequested}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('profile')}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-[#0A1120] border border-slate-700 hover:border-[#D4AF37]/50 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Profile & Status
          </button>
        </div>
      )}

      {/* Digital Membership Card + KPI Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#0A1120] to-[#060911] border border-[#D4AF37]/35 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-sm font-semibold tracking-[0.18em] text-[#E7C860]">
                BOY'S AT THE BACK
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {user.registrationType === 'open'
                  ? 'Open Membership Credential'
                  : 'Vetted Member Credential'}
              </div>
            </div>
            <MembershipStatusBadge status={user.membershipStatus} size="md" />
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

        <div className="xl:col-span-7 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigateTab('directory')}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/40 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Directory</span>
                {hasExclusiveAccess ? (
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                {hasExclusiveAccess ? directoryCount : 'Locked'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {hasExclusiveAccess ? 'Active Members' : 'Approval Required'}
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('announcements')}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/40 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Briefings</span>
                {hasExclusiveAccess ? (
                  <Megaphone className="w-4 h-4 text-[#D4AF37]" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                {hasExclusiveAccess ? announcements.length : 'Locked'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {hasExclusiveAccess ? 'House Notices' : 'Approval Required'}
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('vault')}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/40 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Vault Files</span>
                {hasExclusiveAccess ? (
                  <FolderLock className="w-4 h-4 text-[#D4AF37]" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                {hasExclusiveAccess ? stats?.totalFiles ?? 0 : 'Locked'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {hasExclusiveAccess ? `${stats?.totalBytesFormatted ?? '0 B'} Stored` : 'Approval Required'}
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

          <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-semibold text-white mb-3">
              Member Shortcuts
            </div>
            <div className="flex flex-wrap gap-2.5">
              {hasExclusiveAccess && (
                <>
                  <button
                    onClick={() => onNavigateTab('directory')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Browse Member Directory</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('vault')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060911] border border-slate-700 hover:border-[#D4AF37]/60 text-slate-200 hover:text-[#E7C860] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FolderLock className="w-3.5 h-3.5" />
                    <span>Open Member Vault</span>
                  </button>
                </>
              )}

              <button
                onClick={() => onNavigateTab('profile')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060911] border border-slate-700 hover:border-[#D4AF37]/60 text-slate-200 hover:text-[#E7C860] text-xs font-semibold transition-colors cursor-pointer"
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span>Profile & Status</span>
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

      {/* Latest Announcements Preview (Active / Admin only) */}
      <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">House Announcements & Salons</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasExclusiveAccess
                ? 'Pinned dispatches and upcoming chapter gatherings.'
                : 'Exclusive member briefings unlock once your membership is active.'}
            </p>
          </div>
          {hasExclusiveAccess && (
            <button
              onClick={() => onNavigateTab('announcements')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7C860] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <span>All Announcements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!hasExclusiveAccess ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            <span>
              {user.membershipStatus === 'pending'
                ? 'Your application is currently Pending review. Announcements will appear here upon approval.'
                : 'Exclusive club announcements are reserved for Active members.'}
            </span>
          </div>
        ) : pinnedOrRecent.length === 0 ? (
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
                      <>
                        <span className="inline-flex items-center gap-1 text-[#E7C860] font-semibold">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                        <span className="text-slate-600">·</span>
                      </>
                    )}
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
