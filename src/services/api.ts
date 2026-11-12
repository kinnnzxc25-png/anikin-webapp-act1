import { User, StoredFile, ClientPortal, DashboardStats, PublicPortalData } from '../types';

const TOKEN_KEY = 'tambyus_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
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

  // Auth
  async register(body: { email: string; password: string; name: string; role?: string; company?: string }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/api/auth/register', {
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

  async getCurrentUser(): Promise<User> {
    const data = await this.request<{ user: User }>('/api/auth/me');
    return data.user;
  },

  // Files
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

  // Portals
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

  // Stats
  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/stats');
  },
};
