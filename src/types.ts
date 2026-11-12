export interface User {
  id: string;
  email: string;
  name: string;
  role: 'freelancer' | 'client';
  company: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StoredFile {
  id: string;
  userId: string;
  portalId?: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  uploadedBy: 'freelancer' | 'client';
  uploaderName: string;
  notes?: string;
  category: 'image' | 'document' | 'design' | 'archive' | 'other';
  isStarred?: boolean;
}

export interface ClientPortal {
  id: string;
  freelancerId: string;
  code: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
  fileCount?: number;
  totalSize?: number;
}

export interface DashboardStats {
  totalFiles: number;
  totalBytes: number;
  totalBytesFormatted: string;
  quotaBytes: number;
  quotaPercentage: string;
  categoryBreakdown: {
    image: number;
    document: number;
    design: number;
    archive: number;
    other: number;
  };
  clientUploads: number;
  freelancerUploads: number;
  portalCount: number;
}

export interface PublicPortalData {
  portal: {
    id: string;
    code: string;
    clientName: string;
    projectName: string;
    description: string;
    createdAt: string;
  };
  freelancer: {
    name: string;
    company: string;
    avatarUrl?: string;
  };
  files: Array<{
    id: string;
    originalName: string;
    size: number;
    uploadDate: string;
    category: 'image' | 'document' | 'design' | 'archive' | 'other';
    uploaderName: string;
    uploadedBy: 'freelancer' | 'client';
    notes?: string;
  }>;
}
