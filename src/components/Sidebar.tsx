import React from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  UserCircle,
  FolderLock,
  Shield,
  LogOut,
  X,
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'announcements'
  | 'directory'
  | 'profile'
  | 'vault'
  | 'admin';

interface SidebarProps {
  user: User;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  pendingCount: number;
  announcementsCount: number;
  onSignOut: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  pendingCount,
  announcementsCount,
  onSignOut,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: Array<{
    id: DashboardTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    adminOnly?: boolean;
  }> = [
    {
      id: 'overview',
      label: 'Member Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: <Megaphone className="w-4 h-4" />,
      badge: announcementsCount > 0 ? announcementsCount : undefined,
    },
    {
      id: 'directory',
      label: 'Member Directory',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Profile & Status',
      icon: <UserCircle className="w-4 h-4" />,
    },
    {
      id: 'vault',
      label: 'Member Vault',
      icon: <FolderLock className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      icon: <Shield className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      adminOnly: true,
    },
  ];

  const handleSelect = (tab: DashboardTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const statusColor =
    user.membershipStatus === 'active'
      ? 'text-emerald-400'
      : user.membershipStatus === 'pending'
      ? 'text-amber-400'
      : 'text-rose-400';

  const statusLabel =
    user.membershipStatus === 'active'
      ? 'Active Member'
      : user.membershipStatus === 'pending'
      ? 'Pending Review'
      : user.membershipStatus === 'alumni'
      ? 'Alumni'
      : 'Suspended';

  const sidebarContent = (
    <aside className="w-68 bg-[#060911] text-slate-300 flex flex-col h-full border-r border-[#D4AF37]/15 select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[#D4AF37]/15 flex items-center justify-between">
        <div>
          <div className="font-display text-base font-semibold tracking-[0.14em] text-[#E7C860] leading-tight">
            BOY'S AT THE BACK
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            An Exclusive Community
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Member Credential Strip */}
      <div className="mx-4 mt-4 p-3.5 rounded-xl bg-[#0A1120] border border-[#D4AF37]/20">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono text-[#E7C860] font-semibold tabular-nums">
            {user.memberNumber}
          </span>
          <span className={`font-medium ${statusColor}`}>{statusLabel}</span>
        </div>
        <div className="text-xs font-semibold text-white mt-1 truncate">
          {user.membershipTier}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {user.chapter || 'Manila'} Chapter
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.adminOnly || user.role === 'admin')
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0A1120] text-[#E7C860] border border-[#D4AF37]/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0A1120]/60 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#D4AF37]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded tabular-nums ${
                      item.id === 'admin'
                        ? 'bg-[#D4AF37] text-[#060911] font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3.5 border-t border-[#D4AF37]/15 bg-[#04060B]">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-[#D4AF37]/40 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#0A1120] text-[#E7C860] flex items-center justify-center font-semibold text-xs ring-1 ring-[#D4AF37]/40 shrink-0">
              {user.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {user.role === 'admin' ? 'Club Administrator' : user.company || 'Member'}
            </div>
          </div>

          <button
            onClick={onSignOut}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#0A1120] transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">{sidebarContent}</div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
