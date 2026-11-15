import React, { useState } from 'react';
import { api } from '../services/api';
import { ClientPortal } from '../types';
import { X, FolderPlus, Send } from 'lucide-react';

interface CreatePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (portal: ClientPortal) => void;
}

export const CreatePortalModal: React.FC<CreatePortalModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.createPortal({
        clientName,
        clientEmail,
        projectName,
        description,
      });
      onCreated(res.portal);
      setClientName('');
      setClientEmail('');
      setProjectName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0A1120] rounded-2xl shadow-2xl border border-[#D4AF37]/30 max-w-lg w-full p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#060911] border border-[#D4AF37]/30 text-[#E7C860] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Create Private Drop Portal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate a private upload link for a collaborator or guest.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Folder / Initiative Title
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Tokyo Salon Press Kit & Briefs"
              className="w-full text-xs py-2 px-3 bg-[#060911] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recipient / Partner Name
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Horizon Ventures"
                className="w-full text-xs py-2 px-3 bg-[#060911] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="partner@domain.com"
                className="w-full text-xs py-2 px-3 bg-[#060911] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Upload Instructions <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share instructions for the files to be uploaded..."
              className="w-full text-xs py-2 px-3 bg-[#060911] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2 px-3.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 text-xs font-bold text-[#060911] bg-[#D4AF37] hover:bg-[#E7C860] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Create Drop Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
