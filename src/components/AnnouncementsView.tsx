import React, { useState } from 'react';
import { Announcement, User } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import {
  Megaphone,
  Pin,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  X,
  Send,
} from 'lucide-react';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentUser: User;
  onRefresh: () => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

const CATEGORIES: Array<'All' | Announcement['category']> = [
  'All',
  'Event',
  'Governance',
  'Spotlight',
  'Notice',
];

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  currentUser,
  onRefresh,
  onNotify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Event');
  const [priority, setPriority] = useState<Announcement['priority']>('normal');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const filtered = announcements
    .filter((a) => selectedCategory === 'All' || a.category === selectedCategory)
    .sort((a, b) => {
      if (a.priority === 'pinned' && b.priority !== 'pinned') return -1;
      if (a.priority !== 'pinned' && b.priority === 'pinned') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const pinnedItems = filtered.filter((a) => a.priority === 'pinned');
  const feedItems = filtered.filter((a) => a.priority !== 'pinned');

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await api.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        eventDate: eventDate || undefined,
        location: location.trim() || undefined,
      });
      onNotify('Announcement published to members.');
      setTitle('');
      setContent('');
      setEventDate('');
      setLocation('');
      setPriority('normal');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      onNotify(err.message || 'Could not publish announcement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (item: Announcement) => {
    try {
      const nextPriority = item.priority === 'pinned' ? 'normal' : 'pinned';
      await api.updateAnnouncement(item.id, { priority: nextPriority });
      onNotify(nextPriority === 'pinned' ? 'Announcement pinned.' : 'Announcement unpinned.');
      onRefresh();
    } catch (err: any) {
      onNotify(err.message || 'Failed to update announcement.', 'error');
    }
  };

  const handleDelete = async (item: Announcement) => {
    try {
      await api.deleteAnnouncement(item.id);
      onNotify('Announcement removed.');
      onRefresh();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete announcement.', 'error');
    }
  };

  const renderCard = (item: Announcement) => (
    <article
      key={item.id}
      className={`rounded-2xl border p-6 transition-colors ${
        item.priority === 'pinned'
          ? 'bg-[#0A1120] border-[#D4AF37]/35'
          : 'bg-[#0A1120] border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {item.priority === 'pinned' && (
              <>
                <span className="inline-flex items-center gap-1 text-[#E7C860] font-semibold">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned Dispatch
                </span>
                <span className="text-slate-600">·</span>
              </>
            )}
            <span className="font-semibold text-[#D4AF37]">{item.category}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-400 tabular-nums">
              {formatDate(item.publishedAt)}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">By {item.authorName}</span>
          </div>

          <h3 className="font-display text-xl font-semibold text-white">
            {item.title}
          </h3>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleTogglePin(item)}
              title={item.priority === 'pinned' ? 'Unpin' : 'Pin to top'}
              className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                item.priority === 'pinned'
                  ? 'border-[#D4AF37]/50 text-[#E7C860] bg-[#D4AF37]/10'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              title="Delete announcement"
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3 whitespace-pre-line">
        {item.content}
      </p>

      {(item.eventDate || item.location) && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          {item.eventDate && (
            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[#E7C860]">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(item.eventDate)}
            </span>
          )}
          {item.location && (
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              {item.location}
            </span>
          )}
        </div>
      )}
    </article>
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-[#060911]'
                  : 'text-slate-400 hover:text-white hover:bg-[#060911]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-12 text-center">
          <Megaphone className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No announcements in this category</h3>
          <p className="text-xs text-slate-400 mt-1">
            Switch filters or check back for upcoming salon dispatches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinnedItems.map(renderCard)}
          {feedItems.map(renderCard)}
        </div>
      )}

      {/* Admin Publish Modal */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0A1120] border border-[#D4AF37]/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white">Publish House Announcement</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Broadcast events, governance notes, or spotlights to all members.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autumn Founders' Supper — Manila Backroom"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Event">Event</option>
                    <option value="Governance">Governance</option>
                    <option value="Spotlight">Spotlight</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="normal">Standard Dispatch</option>
                    <option value="pinned">Pinned to Top</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Event Date <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Location <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tokyo Listening Room"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full announcement details for members..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
