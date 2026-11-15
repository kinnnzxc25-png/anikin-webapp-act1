import React, { useState } from 'react';
import { api } from '../services/api';
import { User, MembershipTier } from '../types';
import {
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  Briefcase,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  onBackToLanding: () => void;
  onSuccess: (user: User) => void;
}

const CHAPTERS = ['Manila', 'Tokyo', 'Singapore', 'London', 'New York'];
const TIERS: MembershipTier[] = ['Executive', 'Founding Circle', 'Patron', 'Associate'];

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onBackToLanding,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('Manila');
  const [tierRequested, setTierRequested] = useState<MembershipTier>('Executive');
  const [referralCode, setReferralCode] = useState('');
  const [motivation, setMotivation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await api.login({ email, password });
        onSuccess(res.user);
      } else {
        const res = await api.register({
          email,
          password,
          name,
          company,
          title,
          chapter,
          tierRequested,
          referralCode,
          motivation,
        });
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: 'password123' });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Could not sign in to demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        {/* Back link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#E7C860] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Members & Applicants Portal
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0A1120] border border-[#D4AF37]/40 text-[#E7C860] font-display text-lg font-bold mb-3">
            B
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[0.14em] text-[#E7C860]">
            BOY'S AT THE BACK
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            An Exclusive Community for Members.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0A1120] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Mode Tabs */}
          <div className="flex p-1 bg-[#060911] rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#D4AF37] text-[#060911]'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Member Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#D4AF37] text-[#060911]'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Membership Registration
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-start gap-2">
              <span className="font-bold text-red-400">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
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
                        placeholder="e.g. Lorenzo Santos"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company / Studio
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Atelier North"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Title / Profession
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Managing Partner"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Preferred Chapter
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <select
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                      >
                        {CHAPTERS.map((c) => (
                          <option key={c} value={c}>
                            {c} Chapter
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Membership Tier Requested
                    </label>
                    <select
                      value={tierRequested}
                      onChange={(e) => setTierRequested(e.target.value as MembershipTier)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Member Referral Code <span className="text-slate-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="e.g. BATB-001"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={mode === 'signin' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className={mode === 'signin' ? 'sm:col-span-2' : ''}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-slate-500">
                      Demo password: <code className="font-mono text-slate-300">password123</code>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Brief Introduction & Why You Wish to Join
                </label>
                <textarea
                  rows={2}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Share your work, interests, and what brings you to BOY'S AT THE BACK."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign In to Member Portal'
                  : 'Submit Membership Application'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Instant Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-semibold text-slate-300">Instant Demo Access</span>
              <span className="text-[11px] text-slate-500">1-Click Preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@boysattheback.club')}
                className="p-2.5 rounded-xl bg-[#060911] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#E7C860]">Club Admin</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">Rafael Navarro</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('member@boysattheback.club')}
                className="p-2.5 rounded-xl bg-[#060911] border border-slate-800 hover:border-[#D4AF37]/60 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-white">Active Member</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">Julian Reyes</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('applicant@horizon.co')}
                className="p-2.5 rounded-xl bg-[#060911] border border-slate-800 hover:border-amber-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-amber-300">Pending Status</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">Dante Alcaraz</div>
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Protected Member Registry & Cloud Firestore Persistence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
