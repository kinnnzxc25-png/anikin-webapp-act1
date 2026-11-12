/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { User, StoredFile, ClientPortal, DashboardStats } from './types';
import { AuthView } from './components/AuthView';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { UploadDropzone } from './components/UploadDropzone';
import { FileList } from './components/FileList';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ClientPortalsView } from './components/ClientPortalsView';
import { CreatePortalModal } from './components/CreatePortalModal';
import { PublicClientPortal } from './components/PublicClientPortal';
import { StatsView } from './components/StatsView';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Check URL hash for public client portal mode e.g. #portal=TB-ACME-2026
  const [publicPortalCode, setPublicPortalCode] = useState<string | null>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#portal=')) {
      return hash.replace('#portal=', '');
    }
    return null;
  });

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState<'files' | 'portals' | 'storage'>('files');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Data States
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [portals, setPortals] = useState<ClientPortal[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreatePortalModal, setShowCreatePortalModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    if (!currentUser) return;
    setDataLoading(true);
    try {
      const [filesRes, portalsRes, statsRes] = await Promise.all([
        api.getFiles({ category: activeCategory, search: searchQuery, sortBy }),
        api.getPortals(),
        api.getStats(),
      ]);
      setFiles(filesRes);
      setPortals(portalsRes);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setDataLoading(false);
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
    setFiles([]);
    setPortals([]);
    setStats(null);
    showToast('You have been signed out.');
  };

  // File Upload Success handler
  const handleUploadSuccess = (newFiles: StoredFile[]) => {
    showToast(`Uploaded ${newFiles.length} file(s) successfully.`);
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
      // update stats
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Could not delete file', 'error');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading TamBuys...</span>
        </div>
      </div>
    );
  }

  // Auth screen if not logged in
  if (!currentUser) {
    return (
      <AuthView
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name}!`);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dark Navy Sidebar */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onSignOut={handleSignOut}
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenCreatePortal={() => setShowCreatePortalModal(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar
          title={
            activeTab === 'files'
              ? 'Files & Assets'
              : activeTab === 'portals'
              ? 'Client Portals'
              : 'Vault Storage & Activity'
          }
          subtitle={
            activeTab === 'files'
              ? `Manage and share project files for ${currentUser.company || currentUser.name}`
              : activeTab === 'portals'
              ? 'Dedicated client upload destinations'
              : 'Storage metrics and security controls'
          }
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={() => setShowUploadModal(true)}
          showViewToggle={activeTab === 'files'}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Quick Upload Dropzone Banner (if modal toggle is active) */}
          {showUploadModal && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-200">
              <UploadDropzone
                portals={portals}
                onUploadSuccess={handleUploadSuccess}
                onClose={() => setShowUploadModal(false)}
              />
            </div>
          )}

          {/* Active Tab View */}
          {activeTab === 'files' ? (
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
          ) : activeTab === 'portals' ? (
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
        </main>
      </div>

      {/* Modals */}
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
          showToast(`Portal "${newPortal.projectName}" created!`);
          setActiveTab('portals');
        }}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 py-2.5 px-4 rounded-xl shadow-lg bg-slate-900 text-white text-xs font-medium border border-slate-700/80 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
