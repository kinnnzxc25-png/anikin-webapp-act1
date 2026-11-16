import React, { useState, useEffect } from 'react';
import { User, MembershipApplication } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { MembershipStatusBadge } from './MembershipStatusBadge';
import {
  Save,
  User as UserIcon,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Eye,
  FileCheck2,
} from 'lucide-react';

interface MemberProfileViewProps {
  user: User;
  application?: MembershipApplication | null;
  onUserUpdated: (user: User) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const CHAPTERS = ['Manila', 'Tokyo', 'Singapore', 'London', 'New York'];

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  user,
  application,
  onUserUpdated,
  onNotify,
}) => {
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company || '');
  const [title, setTitle] = useState(user.title || '');
  const [chapter, setChapter] = useState(user.chapter || 'Manila');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [interestsText, setInterestsText] = useState((user.interests || []).join(', '));
  const [isPublicInDirectory, setIsPublicInDirectory] = useState(
    user.isPublicInDirectory !== false
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setCompany(user.company || '');
    setTitle(user.title || '');
    setChapter(user.chapter || 'Manila');
    setPhone(user.phone || '');
    setBio(user.bio || '');
    setInterestsText((user.interests || []).join(', '));
    setIsPublicInDirectory(user.isPublicInDirectory !== false);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const interests = interestsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.updateProfile({
        name: name.trim(),
        company: company.trim(),
        title: title.trim(),
        chapter,
        phone: phone.trim(),
        bio: bio.trim(),
        interests,
        isPublicInDirectory,
      });

      onUserUpdated(res.user);
      onNotify(res.message || 'Member profile updated.');
    } catch (err: any) {
      onNotify(err.message || 'Could not update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const registrationLabel =
    user.registrationType === 'open' ? 'Open Membership' : 'Approval-Based';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Membership Credential Summary */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#0A1120] border border-[#D4AF37]/25 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover ring-1 ring-[#D4AF37]/40 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#060911] text-[#E7C860] flex items-center justify-center font-display text-2xl font-semibold ring-1 ring-[#D4AF37]/40 shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-mono text-xs font-semibold text-[#E7C860] tabular-nums">
                {user.memberNumber}
              </div>
              <h2 className="text-base font-bold text-white truncate mt-0.5">
                {user.name}
              </h2>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Membership Status</span>
              <MembershipStatusBadge status={user.membershipStatus} size="sm" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Registration Method</span>
              <span className="font-semibold text-slate-200">{registrationLabel}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Membership Tier</span>
              <span className="font-semibold text-[#E7C860]">{user.membershipTier}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Home Chapter</span>
              <span className="font-semibold text-white">{user.chapter || 'Manila'}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Role</span>
              <span className="font-semibold text-slate-200 capitalize">{user.role}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Member Since</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {formatDate(user.joinedAt || user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {application && (
          <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Membership Application</span>
              </span>
              <span
                className={`font-semibold capitalize ${
                  application.status === 'approved'
                    ? 'text-emerald-400'
                    : application.status === 'pending'
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {application.status === 'declined' ? 'rejected' : application.status}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between gap-2">
                <span>Requested Tier</span>
                <span className="text-slate-200 font-medium">{application.tierRequested}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Submitted</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {formatDate(application.submittedAt)}
                </span>
              </div>
              {application.reviewedAt && (
                <div className="flex justify-between gap-2">
                  <span>Reviewed</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {formatDate(application.reviewedAt)}
                  </span>
                </div>
              )}
            </div>

            {application.reviewNote && (
              <div className="p-3 rounded-xl bg-[#060911] border border-slate-800 text-slate-300 leading-relaxed">
                <div className="text-[11px] font-semibold text-[#E7C860] mb-1">
                  Committee Note
                </div>
                {application.reviewNote}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Editable Profile Form */}
      <div className="lg:col-span-8">
        <form
          onSubmit={handleSave}
          className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5"
        >
          <div>
            <h3 className="text-sm font-bold text-white">Member Profile & Directory Settings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep your chapter details, bio, and directory visibility current.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Company / Practice
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Title / Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Chapter
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {CHAPTERS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Direct Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 917 000 0000"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Interests <span className="text-slate-500">(Comma separated)</span>
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="Architecture, Venture, Jazz"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Member Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your work, perspective, and areas where fellow members can connect with you..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#060911] border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublicInDirectory}
              onChange={(e) => setIsPublicInDirectory(e.target.checked)}
              className="mt-0.5 accent-[#D4AF37]"
            />
            <div className="text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>List my profile in the Member Directory</span>
              </div>
              <div className="text-slate-400 mt-0.5">
                Active members can view your name, chapter, tier, biography, and interests.
              </div>
            </div>
          </label>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
