import React, { useState, useMemo } from 'react';
import { DirectoryMember } from '../types';
import { formatDate } from '../utils/formatters';
import { Search, Users, MapPin, Building2, X, Calendar } from 'lucide-react';

interface MemberDirectoryViewProps {
  members: DirectoryMember[];
  loading: boolean;
}

const CHAPTERS = ['All Chapters', 'Manila', 'Tokyo', 'Singapore', 'London', 'New York'];
const TIERS = ['All Tiers', 'Founding Circle', 'Executive', 'Patron', 'Associate'];

export const MemberDirectoryView: React.FC<MemberDirectoryViewProps> = ({
  members,
  loading,
}) => {
  const [search, setSearch] = useState('');
  const [chapterFilter, setChapterFilter] = useState('All Chapters');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchChapter =
        chapterFilter === 'All Chapters' || m.chapter === chapterFilter;
      const matchTier =
        tierFilter === 'All Tiers' || m.membershipTier === tierFilter;
      const matchQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q) ||
        m.interests.some((i) => i.toLowerCase().includes(q));
      return matchChapter && matchTier && matchQuery;
    });
  }, [members, search, chapterFilter, tierFilter]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, company, title, ID, or interests..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            {CHAPTERS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-mono tabular-nums">{filtered.length}</strong>{' '}
          verified {filtered.length === 1 ? 'member' : 'members'}
        </span>
        {(search || chapterFilter !== 'All Chapters' || tierFilter !== 'All Tiers') && (
          <button
            onClick={() => {
              setSearch('');
              setChapterFilter('All Chapters');
              setTierFilter('All Tiers');
            }}
            className="text-[#E7C860] hover:text-white cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-52 rounded-2xl bg-[#0A1120] border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-12 text-center">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No matching members</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try clearing your search or selecting another chapter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="text-left bg-[#0A1120] hover:border-[#D4AF37]/45 border border-slate-800 rounded-2xl p-6 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start gap-4">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#D4AF37]/30 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#060911] text-[#E7C860] flex items-center justify-center font-display text-lg font-semibold ring-1 ring-[#D4AF37]/30 shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-[#E7C860] tabular-nums">
                        {member.memberNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">{member.chapter}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#E7C860] transition-colors truncate mt-0.5">
                      {member.name}
                    </h3>
                    <div className="text-xs text-slate-300 truncate mt-0.5">
                      {member.title || 'Member'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {member.company}
                    </div>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-4">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-semibold text-[#D4AF37]">
                  {member.membershipTier}
                </span>
                <span className="text-slate-400 truncate">
                  {member.interests.slice(0, 2).join(' · ') || 'Community Fellow'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0A1120] border border-[#D4AF37]/30 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {selectedMember.avatarUrl ? (
                  <img
                    src={selectedMember.avatarUrl}
                    alt={selectedMember.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-1 ring-[#D4AF37]/40 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#060911] text-[#E7C860] flex items-center justify-center font-display text-2xl font-semibold ring-1 ring-[#D4AF37]/40 shrink-0">
                    {selectedMember.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-[#E7C860] tabular-nums">
                    {selectedMember.memberNumber} · {selectedMember.membershipTier}
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white truncate mt-0.5">
                    {selectedMember.name}
                  </h3>
                  <div className="text-xs text-slate-300 truncate">
                    {[selectedMember.title, selectedMember.company].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#060911] border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{selectedMember.chapter} Chapter</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="font-mono tabular-nums">
                    Joined {formatDate(selectedMember.joinedAt)}
                  </span>
                </div>
                {selectedMember.company && (
                  <div className="col-span-2 flex items-center gap-2 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{selectedMember.company}</span>
                  </div>
                )}
              </div>

              {selectedMember.bio && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                    Biography
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>
              )}

              {selectedMember.interests.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                    Interests & Focus
                  </div>
                  <div className="text-xs text-[#E7C860]">
                    {selectedMember.interests.join(' · ')}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
