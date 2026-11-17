import React, { useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAUpdateBannerProps {
  isAuthenticated: boolean;
}

export const PWAUpdateBanner: React.FC<PWAUpdateBannerProps> = ({
  isAuthenticated,
}) => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  // Safely auto-apply updates only when no authenticated session is active
  useEffect(() => {
    if (needRefresh && !isAuthenticated) {
      updateServiceWorker(true);
    }
  }, [needRefresh, isAuthenticated, updateServiceWorker]);

  if (!needRefresh || !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-[#0A1120] border border-[#D4AF37]/40 px-4 py-2.5 text-xs text-slate-200 shadow-2xl">
      <span className="font-medium">App update ready</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-[#D4AF37] hover:bg-[#E7C860] px-2.5 py-1 text-[11px] font-bold text-[#060911] transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Refresh</span>
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss update notice"
        className="p-1 text-slate-400 hover:text-white cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
