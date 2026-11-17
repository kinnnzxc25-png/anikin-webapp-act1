import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'subtle';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress install prompt when already launched in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop install flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'subtle'
            ? 'inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D4AF37]/30 bg-[#0A1120] hover:border-[#E7C860] text-xs font-medium text-[#E7C860] transition-colors whitespace-nowrap cursor-pointer'
            : 'inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-xs font-semibold text-[#E7C860] transition-colors whitespace-nowrap cursor-pointer'
        }
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari install instructions (WebKit does not emit beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D4AF37]/30 bg-[#0A1120] hover:border-[#E7C860] text-xs font-medium text-[#E7C860] transition-colors whitespace-nowrap cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0A1120] border border-[#D4AF37]/30 p-6 shadow-2xl text-slate-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-wide text-[#E7C860]">
                    Install BOY&apos;S AT THE BACK
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add to your iPhone or iPad Home Screen
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ol className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#E7C860] font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-[#E7C860]" /> Share</strong> button in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#E7C860] font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-[#E7C860]" /> Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#E7C860] font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-white">Add</strong> to launch BOY&apos;S AT THE BACK in standalone app mode.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
