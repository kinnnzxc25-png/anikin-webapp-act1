import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onSignOut: () => void;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onSignOut,
  rightAction,
}) => {
  return (
    <header className="h-16 px-4 sm:px-6 bg-[#0A1120]/95 backdrop-blur-md border-b border-[#D4AF37]/15 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-[#E7C860] cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <PWAInstallButton variant="subtle" />
        {rightAction}
        <button
          onClick={onSignOut}
          className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
