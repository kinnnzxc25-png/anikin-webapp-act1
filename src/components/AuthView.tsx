import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, Building2, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthViewProps {
  onSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');
  const [company, setCompany] = useState('');
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
          role,
          company,
        });
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
      setError(err.message || 'Could not log in to demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Emblem */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B1528] text-white shadow-md shadow-slate-900/10 mb-4 ring-1 ring-white/10">
          <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-7" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          TamBuys
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          The secure client file portal for freelance designers and their clients.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create an Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-start gap-2">
              <span className="shrink-0 text-red-500 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`p-2.5 text-xs text-left rounded-xl border transition-all ${
                        role === 'freelancer'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">Freelancer / Designer</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Collect and deliver files</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`p-2.5 text-xs text-left rounded-xl border transition-all ${
                        role === 'client'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">Client Partner</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Upload project assets</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Studio or Company Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Morgan Studio / Acme Co"
                      className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'signin' && (
                  <span className="text-xs text-slate-400">
                    Use <code className="text-slate-600 font-mono">password123</code> for demo
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#0B1528] hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In to TamBuys</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create an Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                1-Click Instant Demo:
              </span>
              <span>No signup needed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('designer@tambyus.com')}
                className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors group cursor-pointer"
              >
                <img
                  src="/src/assets/images/avatar_designer_1794475769293.jpg"
                  alt="Elena Rostova"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Elena (Designer)
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Studio Rostova</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('client@acmelabs.io')}
                className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors group cursor-pointer"
              >
                <img
                  src="/src/assets/images/avatar_client_1794475781352.jpg"
                  alt="Marcus Vance"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Marcus (Client)
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Acme Innovations</div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Features */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Isolated User Vaults
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Direct File Streaming
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
