import {
  User,
  DirectoryMember,
  MembershipApplication,
  Announcement,
  AdminOverview,
  MembershipStatus,
  MembershipTier,
  RegistrationType,
  UserRole,
  StoredFile,
  ClientPortal,
  DashboardStats,
  PublicPortalData,
} from '../types';

const TOKEN_KEY = 'batb_auth_token';
const LEGACY_TOKEN_KEY = 'tambyus_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed (${response.status})`;
      throw new Error(errorMsg);
    }

    return data as T;
  },

  // -------------------------------------------------------------
  // Authentication & Registration
  // -------------------------------------------------------------
  async register(body: {
    email: string;
    password: string;
    name: string;
    registrationType: RegistrationType;
    company?: string;
    title?: string;
    chapter?: string;
    tierRequested?: MembershipTier;
    motivation?: string;
    referralCode?: string;
  }) {
    const data = await this.request<{ token: string; user: User; application?: MembershipApplication; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(data.token);
    return data;
  },

  async login(body: { email: string; password: string }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(data.token);
    return data;
  },

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.clearToken();
    }
  },

  async getCurrentUser(): Promise<{ user: User; application?: MembershipApplication | null }> {
    const data = await this.request<{ user: User; application?: MembershipApplication | null }>('/api/auth/me');
    return data;
  },

  async getMyApplication(): Promise<MembershipApplication | null> {
    const data = await this.request<{ application: MembershipApplication | null }>('/api/membership/my-application');
    return data.application;
  },

  // -------------------------------------------------------------
  // Member Profile & Directory
  // -------------------------------------------------------------
  async updateProfile(updates: {
    name?: string;
    company?: string;
    title?: string;
    chapter?: string;
    bio?: string;
    phone?: string;
    interests?: string[];
    isPublicInDirectory?: boolean;
  }) {
    const data = await this.request<{ user: User; message: string }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data;
  },

  async getDirectory(params?: { search?: string; chapter?: string; tier?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.chapter) query.set('chapter', params.chapter);
    if (params?.tier) query.set('tier', params.tier);

    const data = await this.request<{ members: DirectoryMember[] }>(`/api/members/directory?${query.toString()}`);
    return data.members;
  },

  // -------------------------------------------------------------
  // Announcements
  // -------------------------------------------------------------
  async getAnnouncements(category?: string) {
    const query = new URLSearchParams();
    if (category && category !== 'all') query.set('category', category);
    const data = await this.request<{ announcements: Announcement[] }>(`/api/announcements?${query.toString()}`);
    return data.announcements;
  },

  async createAnnouncement(payload: {
    title: string;
    content: string;
    category: Announcement['category'];
    priority: Announcement['priority'];
    eventDate?: string;
    location?: string;
  }) {
    return this.request<{ announcement: Announcement; message: string }>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>) {
    return this.request<{ announcement: Announcement; message: string }>(`/api/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteAnnouncement(id: string) {
    return this.request<{ message: string }>(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // -------------------------------------------------------------
  // Admin Console
  // -------------------------------------------------------------
  async getAdminOverview(): Promise<AdminOverview> {
    return this.request<AdminOverview>('/api/admin/overview');
  },

  async getAdminMembers(params?: {
    search?: string;
    status?: string;
    tier?: string;
    chapter?: string;
    registrationType?: string;
  }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.tier && params.tier !== 'all') query.set('tier', params.tier);
    if (params?.chapter && params.chapter !== 'all') query.set('chapter', params.chapter);
    if (params?.registrationType && params.registrationType !== 'all') query.set('registrationType', params.registrationType);
    const qs = query.toString();
    const data = await this.request<{ members: User[] }>(`/api/admin/members${qs ? `?${qs}` : ''}`);
    return data.members;
  },

  async updateAdminMember(
    id: string,
    updates: {
      membershipStatus?: MembershipStatus;
      membershipTier?: MembershipTier;
      role?: UserRole;
      chapter?: string;
      memberNumber?: string;
    }
  ) {
    return this.request<{ member: User; message: string }>(`/api/admin/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getAdminApplications(): Promise<MembershipApplication[]> {
    const data = await this.request<{ applications: MembershipApplication[] }>('/api/admin/applications');
    return data.applications;
  },

  async reviewApplication(
    id: string,
    payload: { action: 'approve' | 'reject' | 'decline'; tier?: MembershipTier; reviewNote?: string }
  ) {
    return this.request<{ application: MembershipApplication; user?: User; message: string }>(
      `/api/admin/applications/${id}/review`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  // -------------------------------------------------------------
  // Preserved Member Vault (Files & Portals)
  // -------------------------------------------------------------
  async getFiles(params?: { category?: string; search?: string; portalId?: string; sortBy?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.portalId) query.set('portalId', params.portalId);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const endpoint = `/api/files?${query.toString()}`;
    const data = await this.request<{ files: StoredFile[] }>(endpoint);
    return data.files;
  },

  async uploadFiles(files: File[], portalId?: string, notes?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (portalId) formData.append('portalId', portalId);
    if (notes) formData.append('notes', notes);

    const data = await this.request<{ files: StoredFile[]; message: string }>('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
    return data;
  },

  async deleteFile(id: string) {
    return this.request<{ message: string }>(`/api/files/${id}`, {
      method: 'DELETE',
    });
  },

  async updateFile(id: string, updates: { notes?: string; originalName?: string; isStarred?: boolean }) {
    return this.request<{ file: StoredFile; message: string }>(`/api/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  getFileDownloadUrl(id: string): string {
    const token = this.getToken();
    return `/api/files/${id}/download?token=${encodeURIComponent(token || '')}`;
  },

  getFilePreviewUrl(id: string): string {
    return `/api/files/${id}/preview`;
  },

  async getPortals() {
    const data = await this.request<{ portals: ClientPortal[] }>('/api/portals');
    return data.portals;
  },

  async createPortal(payload: { clientName: string; clientEmail?: string; projectName: string; description?: string }) {
    const data = await this.request<{ portal: ClientPortal; message: string }>('/api/portals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  async getPublicPortal(code: string): Promise<PublicPortalData> {
    return this.request<PublicPortalData>(`/api/portals/public/${encodeURIComponent(code)}`);
  },

  async uploadToPublicPortal(code: string, files: File[], clientName?: string, notes?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (clientName) formData.append('clientName', clientName);
    if (notes) formData.append('notes', notes);

    return this.request<{ message: string; files: StoredFile[] }>(`/api/portals/public/${encodeURIComponent(code)}/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/stats');
  },
};
