import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  MembershipApplication,
  Announcement,
  AdminOverview,
  MembershipStatus,
  MembershipTier,
  UserRole,
} from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { MembershipStatusBadge } from './MembershipStatusBadge';
import {
  Shield,
  Users,
  ClipboardCheck,
  Megaphone,
  Check,
  X,
  Search,
  Pin,
  Trash2,
  Send,
  Filter,
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: User;
  announcements: Announcement[];
  onRefreshGlobal: () => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const CHAPTERS = ['Manila', 'Tokyo', 'Singapore', 'London', 'New York'];
const TIERS: MembershipTier[] = ['Founding Circle', 'Executive', 'Patron', 'Associate'];
const STATUSES: MembershipStatus[] = ['active', 'pending', 'rejected', 'suspended', 'alumni'];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  announcements,
  onRefreshGlobal,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<'applications' | 'members' | 'announcements'>('applications');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  // Member Search & Filtering
  const [memberSearch, setMemberSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [registrationFilter, setRegistrationFilter] = useState<string>('all');

  // Application Search & Filtering
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewTiers, setReviewTiers] = useState<Record<string, MembershipTier>>({});

  // Quick announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('Notice');
  const [annPriority, setAnnPriority] = useState<Announcement['priority']>('normal');
  const [annPublishing, setAnnPublishing] = useState(false);

  const loadOverviewAndApps = useCallback(async () => {
    if (currentUser.role !== 'admin') return;
    setLoading(true);
    try {
      const [ov, apps] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminApplications(),
      ]);
      setOverview(ov);
      setApplications(apps);
    } catch (err: any) {
      onNotify(err.message || 'Could not load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.role, onNotify]);

  const loadMembers = useCallback(async () => {
    if (currentUser.role !== 'admin') return;
    setMembersLoading(true);
    try {
      const mems = await api.getAdminMembers({
        search: memberSearch.trim() || undefined,
        status: statusFilter,
        tier: tierFilter,
        chapter: chapterFilter,
        registrationType: registrationFilter,
      });
      setMembers(mems);
    } catch (err: any) {
      onNotify(err.message || 'Could not filter members.', 'error');
    } finally {
      setMembersLoading(false);
    }
  }, [currentUser.role, memberSearch, statusFilter, tierFilter, chapterFilter, registrationFilter, onNotify]);

  useEffect(() => {
    loadOverviewAndApps();
  }, [loadOverviewAndApps]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadMembers]);

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-[#0A1120] border border-rose-500/30 rounded-2xl p-10 text-center">
        <Shield className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h2 className="text-sm font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-1">
          Only designated club administrators can review applications and manage member standing.
        </p>
      </div>
    );
  }

  const handleReviewApplication = async (
    app: MembershipApplication,
    action: 'approve' | 'reject'
  ) => {
    try {
      const tier = reviewTiers[app.id] || app.tierRequested;
      const reviewNote = reviewNotes[app.id] || '';
      const res = await api.reviewApplication(app.id, { action, tier, reviewNote });
      onNotify(res.message);
      await Promise.all([loadOverviewAndApps(), loadMembers()]);
      onRefreshGlobal();
    } catch (err: any) {
      onNotify(err.message || 'Review action failed.', 'error');
    }
  };

  const handleMemberUpdate = async (
    memberId: string,
    updates: {
      membershipStatus?: MembershipStatus;
      membershipTier?: MembershipTier;
      role?: UserRole;
      chapter?: string;
    }
  ) => {
    try {
      const res = await api.updateAdminMember(memberId, updates);
      onNotify(res.message);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? res.member : m)));
      loadOverviewAndApps();
      onRefreshGlobal();
    } catch (err: any) {
      onNotify(err.message || 'Could not update member.', 'error');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setAnnPublishing(true);
    try {
      await api.createAnnouncement({
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        priority: annPriority,
      });
      onNotify('Announcement published.');
      setAnnTitle('');
      setAnnContent('');
      onRefreshGlobal();
      loadOverviewAndApps();
    } catch (err: any) {
      onNotify(err.message || 'Publish failed.', 'error');
    } finally {
      setAnnPublishing(false);
    }
  };

  const resetMemberFilters = () => {
    setMemberSearch('');
    setStatusFilter('all');
    setTierFilter('all');
    setChapterFilter('all');
    setRegistrationFilter('all');
  };

  const normalizeAppStatus = (status: MembershipApplication['status']) =>
    status === 'declined' ? 'rejected' : status;

  const filteredApplications = applications.filter((a) => {
    const normalized = normalizeAppStatus(a.status);
    if (appStatusFilter !== 'all' && normalized !== appStatusFilter) return false;
    const q = appSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      a.applicantName.toLowerCase().includes(q) ||
      a.applicantEmail.toLowerCase().includes(q) ||
      (a.company || '').toLowerCase().includes(q) ||
      (a.chapter || '').toLowerCase().includes(q)
    );
  });

  const pendingAppsCount = applications.filter((a) => a.status === 'pending').length;
  const approvedAppsCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedAppsCount = applications.filter(
    (a) => a.status === 'rejected' || a.status === 'declined'
  ).length;

  const hasActiveFilters =
    Boolean(memberSearch.trim()) ||
    statusFilter !== 'all' ||
    tierFilter !== 'all' ||
    chapterFilter !== 'all' ||
    registrationFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400">Total Roster</div>
          <div className="font-mono text-2xl font-semibold text-white tabular-nums mt-1">
            {overview?.totalMembers ?? members.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Registered accounts</div>
        </div>

        <div className="bg-[#0A1120] border border-emerald-500/25 rounded-2xl p-5">
          <div className="text-xs text-emerald-400">Active Members</div>
          <div className="font-mono text-2xl font-semibold text-emerald-400 tabular-nums mt-1">
            {overview?.activeMembers ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Open & approved standing</div>
        </div>

        <div className="bg-[#0A1120] border border-amber-500/30 rounded-2xl p-5">
          <div className="text-xs text-amber-300">Pending Review</div>
          <div className="font-mono text-2xl font-semibold text-amber-300 tabular-nums mt-1">
            {overview?.pendingMembers ?? overview?.pendingApplications ?? pendingAppsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overview?.pendingApplications ?? pendingAppsCount} open application(s)
          </div>
        </div>

        <div className="bg-[#0A1120] border border-rose-500/25 rounded-2xl p-5">
          <div className="text-xs text-rose-400">Rejected</div>
          <div className="font-mono text-2xl font-semibold text-rose-400 tabular-nums mt-1">
            {overview?.rejectedMembers ?? rejectedAppsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Declined applications</div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1.5">
        <button
          onClick={() => setSubTab('applications')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            subTab === 'applications'
              ? 'bg-[#D4AF37] text-[#060911]'
              : 'text-slate-300 hover:text-white hover:bg-[#060911]'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Applications ({pendingAppsCount} Pending)</span>
        </button>

        <button
          onClick={() => setSubTab('members')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            subTab === 'members'
              ? 'bg-[#D4AF37] text-[#060911]'
              : 'text-slate-300 hover:text-white hover:bg-[#060911]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Member Management ({overview?.totalMembers ?? members.length})</span>
        </button>

        <button
          onClick={() => setSubTab('announcements')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            subTab === 'announcements'
              ? 'bg-[#D4AF37] text-[#060911]'
              : 'text-slate-300 hover:text-white hover:bg-[#060911]'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Announcements ({announcements.length})</span>
        </button>
      </div>

      {/* Applications Queue */}
      {subTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `All (${applications.length})` },
                  { id: 'pending', label: `Pending (${pendingAppsCount})` },
                  { id: 'approved', label: `Approved (${approvedAppsCount})` },
                  { id: 'rejected', label: `Rejected (${rejectedAppsCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAppStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    appStatusFilter === tab.id
                      ? 'bg-[#D4AF37] text-[#060911]'
                      : 'bg-[#060911] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search applicants..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Loading membership applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
              No membership applications match the current filter.
            </div>
          ) : (
            filteredApplications.map((app) => {
              const normalizedStatus = normalizeAppStatus(app.status);
              const badgeStatus: MembershipStatus =
                normalizedStatus === 'approved'
                  ? 'active'
                  : normalizedStatus === 'rejected'
                  ? 'rejected'
                  : 'pending';

              return (
                <div
                  key={app.id}
                  className={`bg-[#0A1120] rounded-2xl p-6 space-y-4 border ${
                    normalizedStatus === 'pending'
                      ? 'border-[#D4AF37]/35'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <MembershipStatusBadge status={badgeStatus} size="sm" />
                        <span className="text-slate-600">·</span>
                        <span className="text-[#E7C860] font-semibold">
                          Requested: {app.tierRequested}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">{app.chapter} Chapter</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {formatDate(app.submittedAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2">
                        {app.applicantName}
                      </h3>
                      <div className="text-xs text-slate-300">
                        {[app.title, app.company, app.applicantEmail].filter(Boolean).join(' · ')}
                      </div>
                    </div>

                    {app.referralCode && (
                      <div className="text-xs font-mono text-[#E7C860] shrink-0">
                        Referral: {app.referralCode}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 bg-[#060911] border border-slate-800 rounded-xl p-3.5 leading-relaxed">
                    {app.motivation}
                  </p>

                  {normalizedStatus === 'pending' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                      <div className="sm:col-span-3">
                        <select
                          value={reviewTiers[app.id] || app.tierRequested}
                          onChange={(e) =>
                            setReviewTiers((prev) => ({
                              ...prev,
                              [app.id]: e.target.value as MembershipTier,
                            }))
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                        >
                          {TIERS.map((t) => (
                            <option key={t} value={t}>
                              Assign: {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={reviewNotes[app.id] || ''}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({
                              ...prev,
                              [app.id]: e.target.value,
                            }))
                          }
                          placeholder="Optional committee note..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div className="sm:col-span-4 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReviewApplication(app, 'reject')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleReviewApplication(app, 'approve')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-xs text-slate-400">
                      <div>
                        {app.reviewNote ? (
                          <span>
                            <strong className="text-slate-200">Committee Note:</strong> {app.reviewNote}
                          </span>
                        ) : (
                          <span>Decision recorded without additional note.</span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] tabular-nums shrink-0">
                        Reviewed {formatDate(app.reviewedAt || app.submittedAt)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Members Management with Search & Filtering */}
      {subTab === 'members' && (
        <div className="bg-[#0A1120] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Member Registry Controls</h3>
                <p className="text-xs text-slate-400">
                  Search and filter members by status, tier, chapter, or registration method.
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetMemberFilters}
                  className="self-start sm:self-auto text-xs font-semibold text-[#E7C860] hover:text-white cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search name, email, Member ID, company..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                aria-label="Filter by tier"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="all">All Tiers</option>
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={chapterFilter}
                onChange={(e) => setChapterFilter(e.target.value)}
                aria-label="Filter by chapter"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="all">All Chapters</option>
                {CHAPTERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={registrationFilter}
                onChange={(e) => setRegistrationFilter(e.target.value)}
                aria-label="Filter by registration type"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value="open">Open Membership</option>
                <option value="approval">Approval-Based</option>
              </select>
            </div>
          </div>

          {membersLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Filtering member roster...
            </div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No members match the active search or filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-[#060911]/50 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-[#E7C860] tabular-nums">
                        {m.memberNumber}
                      </span>
                      <span className="font-bold text-white">{m.name}</span>
                      <MembershipStatusBadge status={m.membershipStatus} size="sm" />
                      <span className="px-2 py-0.5 rounded-md bg-[#060911] border border-slate-800 text-[10px] font-medium text-slate-300">
                        {m.registrationType === 'open' ? 'Open Membership' : 'Approval-Based'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2">
                      <span>{m.email}</span>
                      {(m.title || m.company) && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span>{[m.title, m.company].filter(Boolean).join(' · ')}</span>
                        </>
                      )}
                      <span className="text-slate-600">·</span>
                      <span className="font-mono tabular-nums">
                        Joined {formatDate(m.joinedAt || m.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                    <select
                      value={m.membershipStatus}
                      onChange={(e) =>
                        handleMemberUpdate(m.id, {
                          membershipStatus: e.target.value as MembershipStatus,
                        })
                      }
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          Status: {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={m.membershipTier}
                      onChange={(e) =>
                        handleMemberUpdate(m.id, {
                          membershipTier: e.target.value as MembershipTier,
                        })
                      }
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <select
                      value={m.chapter || 'Manila'}
                      onChange={(e) =>
                        handleMemberUpdate(m.id, { chapter: e.target.value })
                      }
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {CHAPTERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={m.role === 'admin' ? 'admin' : 'member'}
                      onChange={(e) =>
                        handleMemberUpdate(m.id, {
                          role: e.target.value as UserRole,
                        })
                      }
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Announcements Manager */}
      {subTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateAnnouncement}
            className="lg:col-span-5 bg-[#0A1120] border border-slate-800 rounded-2xl p-6 space-y-4 h-fit"
          >
            <h3 className="text-sm font-bold text-white">New Dispatch</h3>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Announcement headline..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value as Announcement['category'])}
                className="px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Notice">Notice</option>
                <option value="Event">Event</option>
                <option value="Governance">Governance</option>
                <option value="Spotlight">Spotlight</option>
              </select>

              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as Announcement['priority'])}
                className="px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="normal">Standard</option>
                <option value="pinned">Pinned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Body
              </label>
              <textarea
                rows={4}
                required
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Announcement details..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={annPublishing}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{annPublishing ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#0A1120] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
            {announcements.map((item) => (
              <div key={item.id} className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] text-[#E7C860] font-semibold">
                    {item.category} · {formatDate(item.publishedAt)}
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{item.title}</div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={async () => {
                      await api.updateAnnouncement(item.id, {
                        priority: item.priority === 'pinned' ? 'normal' : 'pinned',
                      });
                      onRefreshGlobal();
                    }}
                    className={`p-2 rounded-lg border cursor-pointer ${
                      item.priority === 'pinned'
                        ? 'border-[#D4AF37]/50 text-[#E7C860]'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      await api.deleteAnnouncement(item.id);
                      onNotify('Announcement deleted.');
                      onRefreshGlobal();
                    }}
                    className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
