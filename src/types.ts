export type MembershipStatus = 'active' | 'pending' | 'rejected' | 'suspended' | 'alumni';
export type MembershipTier = 'Founding Circle' | 'Executive' | 'Patron' | 'Associate';
export type RegistrationType = 'open' | 'approval';
export type UserRole = 'admin' | 'member' | 'freelancer' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  title?: string;
  chapter?: string;
  membershipStatus: MembershipStatus;
  membershipTier: MembershipTier;
  registrationType?: RegistrationType;
  memberNumber: string;
  bio?: string;
  phone?: string;
  interests?: string[];
  isPublicInDirectory?: boolean;
  avatarUrl?: string;
  createdAt: string;
  joinedAt?: string;
}

export interface DirectoryMember {
  id: string;
  name: string;
  company: string;
  title: string;
  chapter: string;
  membershipTier: MembershipTier;
  membershipStatus: MembershipStatus;
  memberNumber: string;
  bio: string;
  interests: string[];
  avatarUrl?: string;
  joinedAt: string;
}

export interface MembershipApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  company: string;
  title: string;
  chapter: string;
  tierRequested: MembershipTier;
  motivation: string;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'declined';
  reviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Event' | 'Governance' | 'Spotlight' | 'Notice';
  priority: 'pinned' | 'normal';
  authorId: string;
  authorName: string;
  eventDate?: string;
  location?: string;
  publishedAt: string;
}

export interface AdminOverview {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  rejectedMembers: number;
  pendingApplications: number;
  suspendedMembers: number;
  announcementsCount: number;
  vaultFilesCount: number;
  tierBreakdown: Record<MembershipTier, number>;
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
  uploadedBy: 'freelancer' | 'client' | 'member' | 'admin';
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
    uploadedBy: 'freelancer' | 'client' | 'member' | 'admin';
    notes?: string;
  }>;
}
