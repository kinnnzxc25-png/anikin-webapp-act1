import React, { useState } from 'react';
import { api } from '../services/api';
import { User, MembershipTier, RegistrationType } from '../types';
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
  Zap,
  FileCheck2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  privateBeta?: boolean;
  authConfigured?: boolean;
  onBackToLanding?: () => void;
  onSuccess: (user: User) => void;
}

const CHAPTERS = ['Manila', 'Tokyo', 'Singapore', 'London', 'New York'];
const OPEN_TIERS: MembershipTier[] = ['Associate', 'Executive', 'Patron'];
const APPROVAL_TIERS: MembershipTier[] = ['Executive', 'Founding Circle', 'Patron', 'Associate'];

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  privateBeta = false,
  authConfigured = true,
  onBackToLanding,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(privateBeta ? 'signin' : initialMode);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('open');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('Manila');
  const [tierRequested, setTierRequested] = useState<MembershipTier>('Associate');
  const [referralCode, setReferralCode] = useState('');
  const [motivation, setMotivation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRegistrationType = (nextType: RegistrationType) => {
    setRegistrationType(nextType);
    setError(null);
    if (nextType === 'open' && tierRequested === 'Founding Circle') {
      setTierRequested('Associate');
    } else if (nextType === 'approval' && tierRequested === 'Associate') {
      setTierRequested('Executive');
    }
  };

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
          registrationType,
          company,
          title,
          chapter,
          tierRequested,
          referralCode: registrationType === 'approval' ? referralCode : undefined,
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

  const effectiveMode = privateBeta ? 'signin' : mode;
  const availableTiers = registrationType === 'open' ? OPEN_TIERS : APPROVAL_TIERS;

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        <div className="mb-6 flex items-center justify-between">
          {!privateBeta && onBackToLanding ? (
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#E7C860] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7C860]">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Beta Environment</span>
            </span>
          )}

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500">
              {privateBeta ? 'Restricted Administrator Portal' : 'Members & Applicants Portal'}
            </span>
            <PWAInstallButton variant="subtle" />
          </div>
        </div>

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

        <div className="bg-[#0A1120] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {privateBeta ? (
            <div className="mb-6 pb-5 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-white">Authorized Administrator Sign In</h2>
                <span className="text-[11px] font-mono text-[#E7C860]">Private Beta</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access is currently limited to the sole authorized administrator. Public registration and member sign-ins are temporarily closed.
              </p>
            </div>
          ) : (
            <div className="flex p-1 bg-[#060911] rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  effectiveMode === 'signin'
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
                  effectiveMode === 'signup'
                    ? 'bg-[#D4AF37] text-[#060911]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                Membership Registration
              </button>
            </div>
          )}

          {privateBeta && !authConfigured && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 leading-relaxed">
              <strong className="block text-amber-300 mb-0.5">Administrator Secret Required</strong>
              Set <code className="font-mono text-white">BETA_ADMIN_PASSWORD</code> in Google AI Studio Secrets and restart the server before signing in.
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
              <span className="font-bold text-rose-400">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {effectiveMode === 'signup' && (
              <>
                {/* Registration Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Choose Registration Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectRegistrationType('open')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        registrationType === 'open'
                          ? 'bg-[#060911] border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                          : 'bg-[#060911]/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold flex items-center gap-1.5 ${
                            registrationType === 'open' ? 'text-[#E7C860]' : 'text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Open Membership
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Instant Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Immediate activation with a unique Member ID and full community access.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRegistrationType('approval')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        registrationType === 'approval'
                          ? 'bg-[#060911] border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                          : 'bg-[#060911]/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold flex items-center gap-1.5 ${
                            registrationType === 'approval' ? 'text-[#E7C860]' : 'text-white'
                          }`}
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Approval-Based
                        </span>
                        <span className="text-[10px] font-mono text-amber-300">
                          Committee Review
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Submit an application for admin vetting; unlocks exclusive access once approved.
                      </p>
                    </button>
                  </div>
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
                  <div className={registrationType === 'open' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {registrationType === 'open'
                        ? 'Membership Tier'
                        : 'Membership Tier Requested'}
                    </label>
                    <select
                      value={tierRequested}
                      onChange={(e) => setTierRequested(e.target.value as MembershipTier)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {availableTiers.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {registrationType === 'approval' && (
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
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={effectiveMode === 'signin' ? 'sm:col-span-2' : ''}>
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

              <div className={effectiveMode === 'signin' ? 'sm:col-span-2' : ''}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {effectiveMode === 'signin' && !privateBeta && (
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
                    placeholder={privateBeta ? 'Enter administrator password' : 'Minimum 6 characters'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {effectiveMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {registrationType === 'approval'
                    ? 'Application Statement & Why You Wish to Join'
                    : 'Brief Bio (Optional)'}
                </label>
                <textarea
                  rows={2}
                  required={registrationType === 'approval'}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Share your background, interests, and what brings you to BOY'S AT THE BACK."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060911] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (privateBeta && !authConfigured)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : effectiveMode === 'signin'
                  ? privateBeta
                    ? 'Sign In to Private Beta'
                    : 'Sign In to Member Portal'
                  : registrationType === 'open'
                  ? 'Complete Open Registration'
                  : 'Submit Approval Application'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Instant Demo Access (Disabled in Private Beta) */}
          {!privateBeta && (
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-slate-300">Instant Demo Access</span>
                <span className="text-[11px] text-slate-500">1-Click Preview</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className="p-2.5 rounded-xl bg-[#060911] border border-slate-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-emerald-400">Active Member</div>
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

                <button
                  type="button"
                  onClick={() => handleDemoLogin('rejected@velvet.co')}
                  className="p-2.5 rounded-xl bg-[#060911] border border-slate-800 hover:border-rose-500/50 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-rose-400">Rejected Status</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">Victor Soriano</div>
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {privateBeta
                ? 'Private Beta Mode · Sole Administrator Enforcement Active'
                : 'Protected Member Registry & Cloud Firestore Persistence'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
