import React from 'react';
import { Download, X, Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallPrompt: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isDismissed,
    isInstalling,
    install,
    dismissPrompt,
  } = usePWAInstall();

  // Only show when browser fired 'beforeinstallprompt' on a non-installed device and user hasn't dismissed it
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <aside
      role="dialog"
      aria-label="Install BATB App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] z-40 rounded-2xl bg-[#0A1120]/95 backdrop-blur-md border border-[#D4AF37]/35 shadow-2xl p-4 sm:p-5 text-slate-100 transition-all"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-[#060911] shrink-0 shadow-lg">
          <img
            src="/pwa-192x192.png"
            alt="BATB App Icon"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E7C860] tracking-wide uppercase">
                <Smartphone className="w-3 h-3 shrink-0" />
                <span>Install BATB App</span>
              </div>
              <h3 className="font-display text-lg font-semibold tracking-[0.08em] text-white leading-tight mt-0.5">
                BOY&apos;S AT THE BACK
              </h3>
            </div>

            <button
              type="button"
              onClick={dismissPrompt}
              aria-label="Dismiss install prompt"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Add BATB to your home screen for instant, full-screen standalone access across desktop and mobile.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>Dedicated app window · No browser clutter</span>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={install}
              disabled={isInstalling}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] disabled:opacity-60 text-[#060911] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {isInstalling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Add to Home Screen</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={dismissPrompt}
              className="py-2 px-3 rounded-xl border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
