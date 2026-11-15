/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import './lib/firebase';
import { api } from './services/api';
import {
  User,
  Announcement,
  DirectoryMember,
  StoredFile,
  ClientPortal,
  DashboardStats,
} from './types';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { Sidebar, DashboardTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MemberOverview } from './components/MemberOverview';
import { AnnouncementsView } from './components/AnnouncementsView';
import { MemberDirectoryView } from './components/MemberDirectoryView';
import { MemberProfileView } from './components/MemberProfileView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { UploadDropzone } from './components/UploadDropzone';
import { FileList } from './components/FileList';
import { ClientPortalsView } from './components/ClientPortalsView';
import { CreatePortalModal } from './components/CreatePortalModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { PublicClientPortal } from './components/PublicClientPortal';
import { StatsView } from './components/StatsView';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Upload,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [publicView, setPublicView] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Check URL hash for public drop portal mode e.g. #portal=TB-ACME-2026
  const [publicPortalCode, setPublicPortalCode] = useState<string | null>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#portal=')) {
      return hash.replace('#portal=', '');
    }
    return null;
  });

  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Membership Data States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [directoryMembers, setDirectoryMembers] = useState<DirectoryMember[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);

  // Preserved Member Vault States
  const [vaultSubTab, setVaultSubTab] = useState<'files' | 'portals' | 'storage'>('files');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const [files, setFiles] = useState<StoredFile[]>([]);
  const [portals, setPortals] = useState<ClientPortal[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreatePortalModal, setShowCreatePortalModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#portal=')) {
        setPublicPortalCode(hash.replace('#portal=', ''));
      } else {
        setPublicPortalCode(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check existing session
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch {
        api.clearToken();
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Load Membership + Preserved Vault Data
  const loadDashboardData = useCallback(async () => {
    if (!currentUser) return;
    setDirectoryLoading(true);
    try {
      const [annRes, dirRes, filesRes, portalsRes, statsRes] = await Promise.all([
        api.getAnnouncements(),
        api.getDirectory(),
        api.getFiles({ category: activeCategory, search: searchQuery, sortBy }),
        api.getPortals(),
        api.getStats(),
      ]);

      setAnnouncements(annRes);
      setDirectoryMembers(dirRes);
      setFiles(filesRes);
      setPortals(portalsRes);
      setStats(statsRes);

      if (currentUser.role === 'admin') {
        const ov = await api.getAdminOverview().catch(() => null);
        if (ov) setPendingApplicationsCount(ov.pendingApplications);
      } else {
        setPendingApplicationsCount(0);
      }
    } catch (err) {
      console.error('Error loading member portal data:', err);
    } finally {
      setDirectoryLoading(false);
    }
  }, [currentUser, activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    if (currentUser && !publicPortalCode) {
      loadDashboardData();
    }
  }, [currentUser, publicPortalCode, loadDashboardData]);

  // Sign out
  const handleSignOut = async () => {
    await api.logout();
    setCurrentUser(null);
    setPublicView('landing');
    setActiveTab('overview');
    setAnnouncements([]);
    setDirectoryMembers([]);
    setFiles([]);
    setPortals([]);
    setStats(null);
    setPendingApplicationsCount(0);
    showToast('You have been signed out.');
  };

  // File Upload Success
  const handleUploadSuccess = (newFiles: StoredFile[]) => {
    showToast(`Uploaded ${newFiles.length} file(s) to Member Vault.`);
    setShowUploadModal(false);
    loadDashboardData();
  };

  // Download Handler
  const handleDownloadFile = (file: StoredFile) => {
    const url = api.getFileDownloadUrl(file.id);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading "${file.originalName}"...`);
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteFile(fileToDelete.id);
      showToast(res.message);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Could not delete file.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Public Portal Navigation
  const handleOpenPublicPortal = (code: string) => {
    window.location.hash = `portal=${code}`;
    setPublicPortalCode(code);
  };

  const handleBackFromPublicPortal = () => {
    window.location.hash = '';
    setPublicPortalCode(null);
  };

  // Render Public Portal if hash is set
  if (publicPortalCode) {
    return (
      <PublicClientPortal
        portalCode={publicPortalCode}
        onBackToDashboard={currentUser ? handleBackFromPublicPortal : undefined}
      />
    );
  }

  // Loading initial state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span>Entering BOY'S AT THE BACK...</span>
        </div>
      </div>
    );
  }

  // Public Landing & Auth Flow
  if (!currentUser) {
    if (publicView === 'landing') {
      return (
        <>
          <LandingPage
            onNavigateAuth={(mode) => {
              setAuthMode(mode);
              setPublicView('auth');
            }}
          />
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 py-2.5 px-4 rounded-xl shadow-xl bg-[#0A1120] text-white text-xs font-medium border border-[#D4AF37]/30">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          )}
        </>
      );
    }

    return (
      <AuthView
        initialMode={authMode}
        onBackToLanding={() => setPublicView('landing')}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab(user.role === 'admin' ? 'overview' : 'overview');
          showToast(`Welcome back, ${user.name}.`);
        }}
      />
    );
  }

  const headerMeta: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Member Dashboard',
      subtitle: `${currentUser.membershipTier} · ${currentUser.chapter || 'Manila'} Chapter`,
    },
    announcements: {
      title: 'House Announcements',
      subtitle: 'Private salon briefings, chapter notices, and governance updates',
    },
    directory: {
      title: 'Member Directory',
      subtitle: 'Verified founders, creative directors, architects, and patrons',
    },
    profile: {
      title: 'Member Profile & Status',
      subtitle: 'Manage your directory biography, chapter, and standing',
    },
    vault: {
      title: 'Member Vault',
      subtitle: 'Encrypted private documents, shared files, and drop portals',
    },
    admin: {
      title: 'Admin Console',
      subtitle: 'Review membership applications, member standing, and dispatches',
    },
  };

  return (
    <div className="flex h-screen bg-[#060911] text-slate-100 overflow-hidden">
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingApplicationsCount}
        announcementsCount={announcements.length}
        onSignOut={handleSignOut}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={headerMeta[activeTab].title}
          subtitle={headerMeta[activeTab].subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSignOut={handleSignOut}
          rightAction={
            activeTab === 'vault' ? (
              <button
                onClick={() => setShowUploadModal((v) => !v)}
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            ) : undefined
          }
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <MemberOverview
              user={currentUser}
              announcements={announcements}
              directoryCount={directoryMembers.length}
              stats={stats}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              currentUser={currentUser}
              onRefresh={loadDashboardData}
              onNotify={showToast}
            />
          )}

          {activeTab === 'directory' && (
            <MemberDirectoryView
              members={directoryMembers}
              loading={directoryLoading}
            />
          )}

          {activeTab === 'profile' && (
            <MemberProfileView
              user={currentUser}
              onUserUpdated={(updated) => {
                setCurrentUser(updated);
                loadDashboardData();
              }}
              onNotify={showToast}
            />
          )}

          {activeTab === 'vault' && (
            <div className="space-y-6">
              {/* Vault Sub-navigation + Search */}
              <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setVaultSubTab('files')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      vaultSubTab === 'files'
                        ? 'bg-[#D4AF37] text-[#060911]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vault Files ({files.length})
                  </button>
                  <button
                    onClick={() => setVaultSubTab('portals')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      vaultSubTab === 'portals'
                        ? 'bg-[#D4AF37] text-[#060911]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Drop Portals ({portals.length})
                  </button>
                  <button
                    onClick={() => setVaultSubTab('storage')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      vaultSubTab === 'storage'
                        ? 'bg-[#D4AF37] text-[#060911]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Storage & Security
                  </button>
                </div>

                {vaultSubTab === 'files' && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vault files..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#060911] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="flex items-center bg-[#060911] border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode('table')}
                        aria-label="Table view"
                        className={`p-1.5 rounded-md cursor-pointer ${
                          viewMode === 'table'
                            ? 'bg-[#0A1120] text-[#E7C860]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid view"
                        className={`p-1.5 rounded-md cursor-pointer ${
                          viewMode === 'grid'
                            ? 'bg-[#0A1120] text-[#E7C860]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showUploadModal && (
                <UploadDropzone
                  portals={portals}
                  onUploadSuccess={handleUploadSuccess}
                  onClose={() => setShowUploadModal(false)}
                />
              )}

              {vaultSubTab === 'files' ? (
                <FileList
                  files={files}
                  viewMode={viewMode}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onPreview={(file) => setPreviewFile(file)}
                  onDownload={handleDownloadFile}
                  onDelete={(file) => setFileToDelete(file)}
                  onOpenUpload={() => setShowUploadModal(true)}
                />
              ) : vaultSubTab === 'portals' ? (
                <ClientPortalsView
                  portals={portals}
                  onCreatePortalClick={() => setShowCreatePortalModal(true)}
                  onOpenPublicPortal={handleOpenPublicPortal}
                />
              ) : (
                <StatsView
                  stats={stats}
                  user={currentUser}
                  onOpenUpload={() => setShowUploadModal(true)}
                />
              )}
            </div>
          )}

          {activeTab === 'admin' && (
            <AdminDashboardView
              currentUser={currentUser}
              announcements={announcements}
              onRefreshGlobal={loadDashboardData}
              onNotify={showToast}
            />
          )}
        </main>
      </div>

      {/* Vault Modals */}
      <DeleteConfirmModal
        file={fileToDelete}
        isOpen={Boolean(fileToDelete)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownloadFile}
      />

      <CreatePortalModal
        isOpen={showCreatePortalModal}
        onClose={() => setShowCreatePortalModal(false)}
        onCreated={(newPortal) => {
          setPortals((prev) => [newPortal, ...prev]);
          showToast(`Drop portal "${newPortal.projectName}" created.`);
          setVaultSubTab('portals');
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 py-2.5 px-4 rounded-xl shadow-xl bg-[#0A1120] text-white text-xs font-medium border border-[#D4AF37]/30">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
