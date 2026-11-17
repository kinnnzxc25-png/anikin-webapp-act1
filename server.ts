import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';

const app = express();
const PORT = 3000;

// Directories setup
const DATA_DIR = path.resolve('data');
const UPLOADS_DIR = path.resolve('data/uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const FIREBASE_CONFIG_FILE = path.resolve('firebase-applet-config.json');

let firestoreDb: any = null;
if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
  try {
    const fbConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8'));
    const fbApp = getApps().length ? getApps()[0] : initializeApp(fbConfig);
    firestoreDb = getFirestore(fbApp, fbConfig.firestoreDatabaseId);
    console.log(`Cloud Firestore active on database: ${fbConfig.firestoreDatabaseId}`);
  } catch (err) {
    console.warn('Firestore initialization notice:', err);
  }
}

// Firestore async sync helpers
async function syncToFirestore(collectionName: string, id: string, data: any) {
  if (!firestoreDb) return;
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(firestoreDb, collectionName, id), cleanData, { merge: true });
  } catch {
    // Non-blocking sync
  }
}

async function deleteFromFirestore(collectionName: string, id: string) {
  if (!firestoreDb) return;
  try {
    await deleteDoc(doc(firestoreDb, collectionName, id));
  } catch {
    // Non-blocking
  }
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Types
export type MembershipStatus = 'active' | 'pending' | 'rejected' | 'suspended' | 'alumni';
export type MembershipTier = 'Founding Circle' | 'Executive' | 'Patron' | 'Associate';
export type RegistrationType = 'open' | 'approval';
export type UserRole = 'admin' | 'member' | 'freelancer' | 'client';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
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

export interface Session {
  token: string;
  userId: string;
  createdAt: number;
}

interface DatabaseSchema {
  users: User[];
  applications: MembershipApplication[];
  announcements: Announcement[];
  portals: ClientPortal[];
  files: StoredFile[];
  sessions: Session[];
}

// Helpers
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

function sanitizeUser(user: User) {
  const { passwordHash: _, salt: __, ...safeUser } = user;
  return safeUser;
}

function determineCategory(filename: string, mimeType: string): 'image' | 'document' | 'design' | 'archive' | 'other' {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'].includes(ext) || mimeType.startsWith('image/')) {
    return 'image';
  }
  if (['.ai', '.psd', '.fig', '.xd', '.sketch', '.eps', '.indd', '.raw'].includes(ext)) {
    return 'design';
  }
  if (['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xlsx', '.xls', '.pptx', '.ppt', '.csv'].includes(ext)) {
    return 'document';
  }
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) {
    return 'archive';
  }
  return 'other';
}

function buildSeedUsers(): User[] {
  const mkUser = (
    partial: Omit<User, 'passwordHash' | 'salt'>
  ): User => {
    const salt = crypto.randomBytes(16).toString('hex');
    return {
      ...partial,
      passwordHash: hashPassword('password123', salt),
      salt,
    };
  };

  return [
    mkUser({
      id: 'user_admin_1',
      email: 'admin@boysattheback.club',
      name: 'Rafael Navarro',
      role: 'admin',
      company: 'Navarro Capital',
      title: 'Club Chairman & Managing Partner',
      chapter: 'Manila',
      membershipStatus: 'active',
      membershipTier: 'Founding Circle',
      memberNumber: 'BATB-001',
      bio: 'Founding chairman of BOY\'S AT THE BACK. Focused on private hospitality, cross-border ventures, and cultivating enduring brotherhood among founders and creatives.',
      phone: '+63 917 555 0101',
      interests: ['Private Equity', 'Architecture', 'Single Malt', 'Jazz'],
      isPublicInDirectory: true,
      avatarUrl: '/src/assets/images/member_founder_portrait_1794742533525.jpg',
      createdAt: '2025-09-01T08:00:00.000Z',
      joinedAt: '2025-09-01T08:00:00.000Z',
    }),
    mkUser({
      id: 'user_member_1',
      email: 'member@boysattheback.club',
      name: 'Julian Reyes',
      role: 'member',
      company: 'Monolith Atelier',
      title: 'Principal Creative Director',
      chapter: 'Tokyo',
      membershipStatus: 'active',
      membershipTier: 'Executive',
      memberNumber: 'BATB-008',
      bio: 'Creative director specializing in tactile brand systems, watchmaking campaigns, and spatial design across Tokyo and Manila.',
      phone: '+81 90 5555 0142',
      interests: ['Industrial Design', 'Horology', 'Vinyl', 'Editorial Print'],
      isPublicInDirectory: true,
      avatarUrl: '/src/assets/images/member_director_portrait_1794742533514.jpg',
      createdAt: '2026-01-12T10:00:00.000Z',
      joinedAt: '2026-01-15T12:00:00.000Z',
    }),
    mkUser({
      id: 'user_member_2',
      email: 'architect@boysattheback.club',
      name: 'Arthur Sterling',
      role: 'member',
      company: 'Sterling & Co. Studio',
      title: 'Founding Architect',
      chapter: 'London',
      membershipStatus: 'active',
      membershipTier: 'Founding Circle',
      memberNumber: 'BATB-003',
      bio: 'Designing private residences, listening rooms, and boutique members lounges across Europe and Southeast Asia.',
      phone: '+44 7700 900123',
      interests: ['Brutalist Architecture', 'Bespoke Tailoring', 'Fine Art'],
      isPublicInDirectory: true,
      avatarUrl: '/src/assets/images/member_architect_portrait_1794742535069.jpg',
      createdAt: '2025-10-04T09:00:00.000Z',
      joinedAt: '2025-10-06T09:00:00.000Z',
    }),
    mkUser({
      id: 'user_freelancer_1',
      email: 'designer@tambyus.com',
      name: 'Elena Rostova',
      role: 'member',
      company: 'Studio Rostova',
      title: 'Design Principal',
      chapter: 'New York',
      membershipStatus: 'active',
      membershipTier: 'Executive',
      memberNumber: 'BATB-019',
      bio: 'Visual identity architect and art director partnering with founders and cultural institutions.',
      phone: '+1 212 555 0198',
      interests: ['Typography', 'Exhibition Design', 'Publishing'],
      isPublicInDirectory: true,
      avatarUrl: '/src/assets/images/avatar_designer_1794475769293.jpg',
      createdAt: '2026-10-01T08:00:00.000Z',
      joinedAt: '2026-10-02T08:00:00.000Z',
    }),
    mkUser({
      id: 'user_client_1',
      email: 'client@acmelabs.io',
      name: 'Marcus Vance',
      role: 'member',
      company: 'Acme Innovations',
      title: 'VP of Strategy',
      chapter: 'Singapore',
      membershipStatus: 'active',
      membershipTier: 'Patron',
      memberNumber: 'BATB-014',
      bio: 'Advising early-stage hardware and consumer luxury teams across APAC.',
      phone: '+65 9123 4567',
      interests: ['Deep Tech', 'Motorsport', 'Culinary Arts'],
      isPublicInDirectory: true,
      avatarUrl: '/src/assets/images/avatar_client_1794475781352.jpg',
      createdAt: '2026-10-15T09:30:00.000Z',
      joinedAt: '2026-10-18T11:00:00.000Z',
    }),
    mkUser({
      id: 'user_pending_1',
      email: 'applicant@horizon.co',
      name: 'Dante Alcaraz',
      role: 'member',
      company: 'Horizon Partners',
      title: 'Venture Partner',
      chapter: 'Manila',
      membershipStatus: 'pending',
      membershipTier: 'Executive',
      registrationType: 'approval',
      memberNumber: 'BATB-PEND',
      bio: 'Early-stage investor backing design-led consumer brands and fintech founders in Southeast Asia.',
      phone: '+63 917 555 0884',
      interests: ['Venture Capital', 'Contemporary Art', 'Espresso'],
      isPublicInDirectory: false,
      createdAt: '2026-11-12T08:00:00.000Z',
    }),
    mkUser({
      id: 'user_rejected_1',
      email: 'rejected@velvet.co',
      name: 'Victor Soriano',
      role: 'member',
      company: 'Velvet Media Group',
      title: 'Managing Director',
      chapter: 'Singapore',
      membershipStatus: 'rejected',
      membershipTier: 'Founding Circle',
      registrationType: 'approval',
      memberNumber: 'BATB-REJ',
      bio: 'Brand partnerships and experiential hospitality across APAC.',
      phone: '+65 9888 1204',
      interests: ['Hospitality', 'Media'],
      isPublicInDirectory: false,
      createdAt: '2026-11-08T10:00:00.000Z',
    }),
  ];
}

function buildSeedApplications(): MembershipApplication[] {
  return [
    {
      id: 'app_seed_1',
      userId: 'user_pending_1',
      applicantName: 'Dante Alcaraz',
      applicantEmail: 'applicant@horizon.co',
      company: 'Horizon Partners',
      title: 'Venture Partner',
      chapter: 'Manila',
      tierRequested: 'Executive',
      motivation: 'Looking to connect with fellow founders and creative directors in the Manila and Singapore chapters for off-the-record founder dinners and collaborative studio salons.',
      referralCode: 'BATB-001',
      status: 'pending',
      submittedAt: '2026-11-12T08:00:00.000Z',
    },
    {
      id: 'app_seed_2',
      userId: 'user_member_1',
      applicantName: 'Julian Reyes',
      applicantEmail: 'member@boysattheback.club',
      company: 'Monolith Atelier',
      title: 'Principal Creative Director',
      chapter: 'Tokyo',
      tierRequested: 'Executive',
      motivation: 'Collaborating with architectural and venture members across Tokyo and Manila.',
      referralCode: 'BATB-003',
      status: 'approved',
      reviewNote: 'Vouched by Arthur Sterling. Welcomed to Tokyo Chapter.',
      submittedAt: '2026-01-12T10:00:00.000Z',
      reviewedAt: '2026-01-15T12:00:00.000Z',
    },
    {
      id: 'app_seed_3',
      userId: 'user_rejected_1',
      applicantName: 'Victor Soriano',
      applicantEmail: 'rejected@velvet.co',
      company: 'Velvet Media Group',
      title: 'Managing Director',
      chapter: 'Singapore',
      tierRequested: 'Founding Circle',
      motivation: 'Applying directly for Founding Circle access in Singapore.',
      status: 'rejected',
      reviewNote: 'Founding Circle currently requires two existing chapter sponsors. You may re-apply under Open Membership or Associate.',
      submittedAt: '2026-11-08T10:00:00.000Z',
      reviewedAt: '2026-11-10T15:30:00.000Z',
    },
  ];
}

function buildSeedAnnouncements(): Announcement[] {
  return [
    {
      id: 'ann_seed_1',
      title: 'Annual Black-Tie Supper & Founders\' Salon',
      content: 'Join Founding Circle and Executive members for an evening of private dining, off-the-record roundtables, and live quartet jazz in the backroom library. Dress code: Midnight navy or black tie.',
      category: 'Event',
      priority: 'pinned',
      authorId: 'user_admin_1',
      authorName: 'Rafael Navarro',
      eventDate: 'Dec 04, 2026 · 8:00 PM',
      location: 'The Backroom Lounge, Makati / Manila',
      publishedAt: '2026-11-14T18:00:00.000Z',
    },
    {
      id: 'ann_seed_2',
      title: '2027 Member Charter & Global Chapter Reciprocity',
      content: 'Effective January 2027, active members in good standing receive seamless reciprocal lounge privileges across Manila, Tokyo, Singapore, London, and New York chapters. Digital member credentials are now active in your Profile tab.',
      category: 'Governance',
      priority: 'pinned',
      authorId: 'user_admin_1',
      authorName: 'Rafael Navarro',
      publishedAt: '2026-11-11T10:30:00.000Z',
    },
    {
      id: 'ann_seed_3',
      title: 'Tokyo Chapter: Late-Night Listening & Rare Vintage Tasting',
      content: 'Hosted by Julian Reyes at our Aoyama listening room. Limited to 18 seated places for members and one accompanied guest. Please review the briefing notes in the Member Vault.',
      category: 'Event',
      priority: 'normal',
      authorId: 'user_admin_1',
      authorName: 'Rafael Navarro',
      eventDate: 'Nov 28, 2026 · 9:30 PM',
      location: 'Aoyama Listening Room, Tokyo',
      publishedAt: '2026-11-09T14:15:00.000Z',
    },
    {
      id: 'ann_seed_4',
      title: 'Member Spotlight: Sterling & Co. Opens Kyoto Pavilion',
      content: 'Congratulations to Founding Circle member Arthur Sterling on unveiling the Kyoto timber & basalt tea pavilion. Private architectural walkthrough available for visiting members through December.',
      category: 'Spotlight',
      priority: 'normal',
      authorId: 'user_admin_1',
      authorName: 'Rafael Navarro',
      publishedAt: '2026-11-05T09:00:00.000Z',
    },
  ];
}

const SEED_EMAILS = [
  'admin@boysattheback.club',
  'member@boysattheback.club',
  'architect@boysattheback.club',
  'designer@tambyus.com',
  'client@acmelabs.io',
  'applicant@horizon.co',
  'rejected@velvet.co',
];

// Seed & Migrate Database safely
function initDatabase(): DatabaseSchema {
  const seedApps = buildSeedApplications();
  const seedAnns = buildSeedAnnouncements();

  const portal1: ClientPortal = {
    id: 'portal_acme_1',
    freelancerId: 'user_admin_1',
    code: 'TB-ACME-2026',
    clientName: 'Acme Innovations',
    clientEmail: 'client@acmelabs.io',
    projectName: 'Founders Handbook & Event Assets',
    description: 'Shared vault for club governance documents, architectural renders, and private event photography.',
    status: 'active',
    createdAt: '2026-10-16T10:00:00.000Z',
  };

  const portal2: ClientPortal = {
    id: 'portal_launch_2',
    freelancerId: 'user_admin_1',
    code: 'TB-LAUNCH-884',
    clientName: 'Tokyo Chapter',
    clientEmail: 'member@boysattheback.club',
    projectName: 'Tokyo Salon Press & Media Kit',
    description: 'Upload editorial photos, listening room specs, and guest passes.',
    status: 'active',
    createdAt: '2026-11-01T14:20:00.000Z',
  };

  const sampleFilesData: StoredFile[] = [
    {
      id: 'file_seed_1',
      userId: 'user_admin_1',
      portalId: portal1.id,
      originalName: 'BATB_2027_Member_Charter.pdf',
      storedName: 'sample_guidelines.pdf',
      mimeType: 'application/pdf',
      size: 3420800,
      uploadDate: '2026-11-10T11:24:00.000Z',
      uploadedBy: 'admin',
      uploaderName: 'Rafael Navarro',
      notes: 'Official 2027 membership charter, lounge etiquette, and global reciprocity protocols.',
      category: 'document',
      isStarred: true,
    },
    {
      id: 'file_seed_2',
      userId: 'user_admin_1',
      portalId: portal1.id,
      originalName: 'Club_Crest_Gold_Emblem.svg',
      storedName: 'sample_logo.svg',
      mimeType: 'image/svg+xml',
      size: 485120,
      uploadDate: '2026-11-10T14:15:00.000Z',
      uploadedBy: 'member',
      uploaderName: 'Julian Reyes',
      notes: 'Vector club monogram in burnished gold for print and event invitations.',
      category: 'image',
      isStarred: true,
    },
    {
      id: 'file_seed_3',
      userId: 'user_freelancer_1',
      portalId: portal1.id,
      originalName: 'Studio_Packaging_Render_4K.png',
      storedName: 'sample_render.png',
      mimeType: 'image/png',
      size: 5120400,
      uploadDate: '2026-11-11T09:40:00.000Z',
      uploadedBy: 'freelancer',
      uploaderName: 'Elena Rostova',
      notes: 'Archival project render from Studio Rostova.',
      category: 'image',
      isStarred: false,
    },
  ];

  // Ensure sample physical files exist
  for (const f of sampleFilesData) {
    const filePath = path.join(UPLOADS_DIR, f.storedName);
    if (!fs.existsSync(filePath)) {
      if (f.originalName.endsWith('.svg')) {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
          <rect width="400" height="120" rx="16" fill="#060911"/>
          <rect x="2" y="2" width="396" height="116" rx="14" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
          <text x="200" y="68" text-anchor="middle" fill="#D4AF37" font-family="Georgia, serif" font-size="24" font-weight="bold" letter-spacing="3">BOY'S AT THE BACK</text>
        </svg>`;
        fs.writeFileSync(filePath, svgContent, 'utf-8');
      } else {
        const sampleBuffer = Buffer.alloc(Math.min(f.size, 1024 * 16));
        sampleBuffer.fill(f.originalName);
        fs.writeFileSync(filePath, sampleBuffer);
      }
    }
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Partial<DatabaseSchema>;
      if (existingData.users && existingData.files) {
        // Migrate existing users cleanly without overwriting user records
        const migratedUsers: User[] = existingData.users.map((u, idx) => ({
          ...u,
          membershipStatus: u.membershipStatus || 'active',
          membershipTier: u.membershipTier || (u.role === 'admin' ? 'Founding Circle' : 'Executive'),
          memberNumber: u.memberNumber || `BATB-${String(idx + 10).padStart(3, '0')}`,
          chapter: u.chapter || 'Manila',
          title: u.title || (u.role === 'admin' ? 'Club Administrator' : 'Member'),
          bio: u.bio || 'Active member of BOY\'S AT THE BACK.',
          interests: u.interests || ['Private Salons', 'Architecture', 'Design'],
          isPublicInDirectory: u.isPublicInDirectory ?? true,
          joinedAt: u.joinedAt || u.createdAt,
        }));

        // Ensure core seeded accounts exist if not already present (avoid scrypt work when already seeded)
        const existingEmails = new Set(migratedUsers.map((u) => u.email.toLowerCase()));
        const missingSeed = SEED_EMAILS.some((email) => !existingEmails.has(email));
        if (missingSeed) {
          const seedUsers = buildSeedUsers();
          for (const su of seedUsers) {
            if (!existingEmails.has(su.email.toLowerCase())) {
              migratedUsers.push(su);
            }
          }
        }

        const existingAppIds = new Set((existingData.applications || []).map((a) => a.id));
        const mergedApps = [...(existingData.applications || [])];
        for (const sa of seedApps) {
          if (!existingAppIds.has(sa.id)) {
            mergedApps.push(sa);
          }
        }

        const migrated: DatabaseSchema = {
          users: migratedUsers.map((u) => ({
            ...u,
            registrationType: u.registrationType || (u.membershipStatus === 'pending' || u.membershipStatus === 'rejected' ? 'approval' : 'approval'),
          })),
          applications: mergedApps.length > 0 ? mergedApps : seedApps,
          announcements: existingData.announcements && existingData.announcements.length > 0 ? existingData.announcements : seedAnns,
          portals: existingData.portals && existingData.portals.length > 0 ? existingData.portals : [portal1, portal2],
          files: existingData.files.length > 0 ? existingData.files : sampleFilesData,
          sessions: existingData.sessions || [],
        };
        if (missingSeed || mergedApps.length !== (existingData.applications || []).length || !existingData.announcements) {
          fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2), 'utf-8');
        }
        return migrated;
      }
    } catch {
      // fallback to fresh init
    }
  }

  const seedUsers = buildSeedUsers();
  const db: DatabaseSchema = {
    users: seedUsers,
    applications: seedApps,
    announcements: seedAnns,
    portals: [portal1, portal2],
    files: sampleFilesData,
    sessions: [],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  return db;
}

let db = initDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// Auth Middleware
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const session = db.sessions.find((s) => s.token === token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  (req as any).user = user;
  next();
}

function generateUniqueMemberNumber(): string {
  const existingNumbers = new Set(db.users.map((u) => u.memberNumber.toUpperCase()));
  let maxSeq = 20;
  for (const u of db.users) {
    const match = /^BATB-(\d+)$/i.exec(u.memberNumber);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxSeq) maxSeq = n;
    }
  }
  let candidateNum = maxSeq + 1;
  while (existingNumbers.has(`BATB-${String(candidateNum).padStart(3, '0')}`)) {
    candidateNum++;
  }
  return `BATB-${String(candidateNum).padStart(3, '0')}`;
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator privileges required.' });
  }
  next();
}

function requireActiveMember(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as User;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (user.role === 'admin' || user.membershipStatus === 'active') {
    return next();
  }
  if (user.membershipStatus === 'pending') {
    return res.status(403).json({ error: 'Your membership application is pending approval. Exclusive features unlock once approved.' });
  }
  if (user.membershipStatus === 'rejected') {
    return res.status(403).json({ error: 'Your membership application was not approved. Exclusive member access is restricted.' });
  }
  return res.status(403).json({ error: 'Active membership standing is required to access exclusive member features.' });
}

// -------------------------------------------------------------
// Authentication & Membership Registration Endpoints
// -------------------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const {
    email,
    password,
    name,
    registrationType = 'approval',
    company = '',
    title = '',
    chapter = 'Manila',
    tierRequested = 'Executive',
    motivation = '',
    referralCode = '',
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide your full name, email, and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  const regType: RegistrationType = registrationType === 'open' ? 'open' : 'approval';

  const validTier: MembershipTier =
    regType === 'open'
      ? (['Executive', 'Patron', 'Associate'].includes(tierRequested) ? tierRequested : 'Associate')
      : (['Founding Circle', 'Executive', 'Patron', 'Associate'].includes(tierRequested) ? tierRequested : 'Executive');

  const salt = crypto.randomBytes(16).toString('hex');
  const now = new Date().toISOString();
  const isOpen = regType === 'open';
  const assignedMemberNumber = isOpen ? generateUniqueMemberNumber() : 'BATB-PEND';

  const newUser: User = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: normalizedEmail,
    passwordHash: hashPassword(password, salt),
    salt,
    name: name.trim(),
    role: 'member',
    company: company.trim() || 'Independent Venture',
    title: title.trim() || (isOpen ? 'Member' : 'Prospective Member'),
    chapter: chapter.trim() || 'Manila',
    membershipStatus: isOpen ? 'active' : 'pending',
    membershipTier: validTier,
    registrationType: regType,
    memberNumber: assignedMemberNumber,
    bio: motivation.trim() || (isOpen ? 'Open-enrollment member at BOY\'S AT THE BACK.' : 'New applicant to BOY\'S AT THE BACK.'),
    interests: ['Networking', 'Private Salons'],
    isPublicInDirectory: isOpen,
    createdAt: now,
    joinedAt: isOpen ? now : undefined,
  };

  let createdApplication: MembershipApplication | undefined;
  if (!isOpen) {
    createdApplication = {
      id: `app_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: newUser.id,
      applicantName: newUser.name,
      applicantEmail: newUser.email,
      company: newUser.company,
      title: newUser.title || 'Member Applicant',
      chapter: newUser.chapter || 'Manila',
      tierRequested: validTier,
      motivation: motivation.trim() || 'Interested in joining the community and attending private chapter salons.',
      referralCode: referralCode.trim() || undefined,
      status: 'pending',
      submittedAt: now,
    };
    db.applications.unshift(createdApplication);
  }

  db.users.push(newUser);

  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    userId: newUser.id,
    createdAt: Date.now(),
  });

  saveDatabase();

  const safeUser = sanitizeUser(newUser);
  syncToFirestore('users', newUser.id, safeUser);
  if (createdApplication) {
    syncToFirestore('applications', createdApplication.id, createdApplication);
  }

  return res.json({
    token,
    user: safeUser,
    application: createdApplication,
    message: isOpen
      ? `Welcome to BOY'S AT THE BACK! Your Open Membership is active (${assignedMemberNumber}).`
      : 'Membership application submitted! Your profile is currently pending committee review.',
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    userId: user.id,
    createdAt: Date.now(),
  });

  saveDatabase();

  return res.json({
    token,
    user: sanitizeUser(user),
    message: `Welcome back, ${user.name}.`,
  });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const user = (req as any).user as User;
  db.sessions = db.sessions.filter((s) => s.userId !== user.id);
  saveDatabase();
  return res.json({ message: 'Signed out successfully.' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const application = db.applications.find((a) => a.userId === user.id) || null;
  return res.json({ user: sanitizeUser(user), application });
});

app.get('/api/membership/my-application', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const application = db.applications.find((a) => a.userId === user.id) || null;
  return res.json({ application });
});

// -------------------------------------------------------------
// Member Profile & Directory Endpoints
// -------------------------------------------------------------

app.patch('/api/profile', authenticate, (req, res) => {
  const currentUser = (req as any).user as User;
  const user = db.users.find((u) => u.id === currentUser.id);
  if (!user) {
    return res.status(404).json({ error: 'Member profile not found.' });
  }

  const { name, company, title, chapter, bio, phone, interests, isPublicInDirectory } = req.body;

  if (typeof name === 'string' && name.trim()) user.name = name.trim().slice(0, 128);
  if (typeof company === 'string') user.company = company.trim().slice(0, 128);
  if (typeof title === 'string') user.title = title.trim().slice(0, 128);
  if (typeof chapter === 'string' && chapter.trim()) user.chapter = chapter.trim().slice(0, 64);
  if (typeof bio === 'string') user.bio = bio.trim().slice(0, 2048);
  if (typeof phone === 'string') user.phone = phone.trim().slice(0, 64);
  if (Array.isArray(interests)) {
    user.interests = interests
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  if (typeof isPublicInDirectory === 'boolean') {
    user.isPublicInDirectory = isPublicInDirectory;
  }

  saveDatabase();
  const safeUser = sanitizeUser(user);
  syncToFirestore('users', user.id, safeUser);

  return res.json({
    user: safeUser,
    message: 'Member profile updated.',
  });
});

app.get('/api/members/directory', authenticate, requireActiveMember, (req, res) => {
  const { search, chapter, tier } = req.query;

  let members = db.users.filter(
    (u) => u.membershipStatus === 'active' && u.isPublicInDirectory !== false
  );

  if (typeof chapter === 'string' && chapter !== 'all' && chapter.trim()) {
    members = members.filter((m) => (m.chapter || '').toLowerCase() === chapter.trim().toLowerCase());
  }

  if (typeof tier === 'string' && tier !== 'all' && tier.trim()) {
    members = members.filter((m) => m.membershipTier === tier.trim());
  }

  if (typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    members = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        (m.title || '').toLowerCase().includes(q) ||
        (m.chapter || '').toLowerCase().includes(q) ||
        (m.bio || '').toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q)
    );
  }

  const directoryPayload = members.map((m) => ({
    id: m.id,
    name: m.name,
    company: m.company,
    title: m.title || 'Member',
    chapter: m.chapter || 'Manila',
    membershipTier: m.membershipTier,
    membershipStatus: m.membershipStatus,
    memberNumber: m.memberNumber,
    bio: m.bio || '',
    interests: m.interests || [],
    avatarUrl: m.avatarUrl,
    joinedAt: m.joinedAt || m.createdAt,
  }));

  return res.json({ members: directoryPayload });
});

// -------------------------------------------------------------
// Announcements Endpoints
// -------------------------------------------------------------

app.get('/api/announcements', authenticate, requireActiveMember, (req, res) => {
  const { category } = req.query;
  let list = [...db.announcements];

  if (typeof category === 'string' && category !== 'all') {
    list = list.filter((a) => a.category === category);
  }

  // Pinned first, then newest
  list.sort((a, b) => {
    if (a.priority === 'pinned' && b.priority !== 'pinned') return -1;
    if (b.priority === 'pinned' && a.priority !== 'pinned') return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return res.json({ announcements: list });
});

app.post('/api/announcements', authenticate, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const { title, content, category = 'Notice', priority = 'normal', eventDate, location } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Announcement title and content are required.' });
  }

  const validCategory = ['Event', 'Governance', 'Spotlight', 'Notice'].includes(category) ? category : 'Notice';
  const validPriority = priority === 'pinned' ? 'pinned' : 'normal';

  const announcement: Announcement = {
    id: `ann_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: title.trim().slice(0, 255),
    content: content.trim().slice(0, 4096),
    category: validCategory,
    priority: validPriority,
    authorId: user.id,
    authorName: user.name,
    eventDate: eventDate ? String(eventDate).trim().slice(0, 64) : undefined,
    location: location ? String(location).trim().slice(0, 255) : undefined,
    publishedAt: new Date().toISOString(),
  };

  db.announcements.unshift(announcement);
  saveDatabase();
  syncToFirestore('announcements', announcement.id, announcement);

  return res.json({ announcement, message: 'Announcement published to all members.' });
});

app.patch('/api/announcements/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const ann = db.announcements.find((a) => a.id === id);
  if (!ann) {
    return res.status(404).json({ error: 'Announcement not found.' });
  }

  const { title, content, category, priority, eventDate, location } = req.body;
  if (typeof title === 'string' && title.trim()) ann.title = title.trim().slice(0, 255);
  if (typeof content === 'string' && content.trim()) ann.content = content.trim().slice(0, 4096);
  if (['Event', 'Governance', 'Spotlight', 'Notice'].includes(category)) ann.category = category;
  if (priority === 'pinned' || priority === 'normal') ann.priority = priority;
  if (eventDate !== undefined) ann.eventDate = eventDate ? String(eventDate).trim() : undefined;
  if (location !== undefined) ann.location = location ? String(location).trim() : undefined;

  saveDatabase();
  syncToFirestore('announcements', ann.id, ann);
  return res.json({ announcement: ann, message: 'Announcement updated.' });
});

app.delete('/api/announcements/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = db.announcements.findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Announcement not found.' });
  }

  db.announcements.splice(idx, 1);
  saveDatabase();
  deleteFromFirestore('announcements', id);

  return res.json({ message: 'Announcement removed.' });
});

// -------------------------------------------------------------
// Admin Management Endpoints
// -------------------------------------------------------------

app.get('/api/admin/overview', authenticate, requireAdmin, (_req, res) => {
  const totalMembers = db.users.length;
  const activeMembers = db.users.filter((u) => u.membershipStatus === 'active').length;
  const pendingMembers = db.users.filter((u) => u.membershipStatus === 'pending').length;
  const rejectedMembers = db.users.filter((u) => u.membershipStatus === 'rejected').length;
  const pendingApplications = db.applications.filter((a) => a.status === 'pending').length;
  const suspendedMembers = db.users.filter((u) => u.membershipStatus === 'suspended').length;

  const tierBreakdown: Record<MembershipTier, number> = {
    'Founding Circle': db.users.filter((u) => u.membershipTier === 'Founding Circle').length,
    Executive: db.users.filter((u) => u.membershipTier === 'Executive').length,
    Patron: db.users.filter((u) => u.membershipTier === 'Patron').length,
    Associate: db.users.filter((u) => u.membershipTier === 'Associate').length,
  };

  return res.json({
    totalMembers,
    activeMembers,
    pendingMembers,
    rejectedMembers,
    pendingApplications,
    suspendedMembers,
    announcementsCount: db.announcements.length,
    vaultFilesCount: db.files.length,
    tierBreakdown,
  });
});

app.get('/api/admin/members', authenticate, requireAdmin, (req, res) => {
  const { search, status, tier, chapter, registrationType } = req.query;

  let members = db.users.map((u) => sanitizeUser(u));

  if (typeof status === 'string' && status !== 'all' && status.trim()) {
    members = members.filter((m) => m.membershipStatus === status.trim());
  }
  if (typeof tier === 'string' && tier !== 'all' && tier.trim()) {
    members = members.filter((m) => m.membershipTier === tier.trim());
  }
  if (typeof chapter === 'string' && chapter !== 'all' && chapter.trim()) {
    members = members.filter((m) => (m.chapter || '').toLowerCase() === chapter.trim().toLowerCase());
  }
  if (typeof registrationType === 'string' && registrationType !== 'all' && registrationType.trim()) {
    members = members.filter((m) => (m.registrationType || 'approval') === registrationType.trim());
  }
  if (typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    members = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q) ||
        (m.company || '').toLowerCase().includes(q) ||
        (m.title || '').toLowerCase().includes(q)
    );
  }

  members.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ members });
});

app.patch('/api/admin/members/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const member = db.users.find((u) => u.id === id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  const { membershipStatus, membershipTier, role, chapter, memberNumber } = req.body;
  const now = new Date().toISOString();

  if (['active', 'pending', 'rejected', 'suspended', 'alumni'].includes(membershipStatus)) {
    member.membershipStatus = membershipStatus;
    if (membershipStatus === 'active') {
      if (!member.memberNumber || member.memberNumber === 'BATB-PEND' || member.memberNumber === 'BATB-REJ') {
        member.memberNumber = generateUniqueMemberNumber();
      }
      member.joinedAt = member.joinedAt || now;
      member.isPublicInDirectory = true;
    } else if (membershipStatus === 'rejected') {
      if (!member.memberNumber || member.memberNumber === 'BATB-PEND') {
        member.memberNumber = 'BATB-REJ';
      }
      member.isPublicInDirectory = false;
    } else if (membershipStatus === 'pending') {
      member.isPublicInDirectory = false;
    } else if (membershipStatus === 'suspended') {
      member.isPublicInDirectory = false;
    }

    // Keep linked application status synchronized when admin transitions status directly
    if (membershipStatus === 'active' || membershipStatus === 'rejected') {
      const linkedApp = db.applications.find((a) => a.userId === member.id && a.status === 'pending');
      if (linkedApp) {
        linkedApp.status = membershipStatus === 'active' ? 'approved' : 'rejected';
        linkedApp.reviewedAt = now;
        syncToFirestore('applications', linkedApp.id, linkedApp);
      }
    }
  }
  if (['Founding Circle', 'Executive', 'Patron', 'Associate'].includes(membershipTier)) {
    member.membershipTier = membershipTier;
  }
  if (['admin', 'member', 'freelancer', 'client'].includes(role)) {
    member.role = role;
  }
  if (typeof chapter === 'string' && chapter.trim()) {
    member.chapter = chapter.trim().slice(0, 64);
  }
  if (typeof memberNumber === 'string' && memberNumber.trim()) {
    member.memberNumber = memberNumber.trim().slice(0, 32);
  }

  saveDatabase();
  const safeMember = sanitizeUser(member);
  syncToFirestore('users', member.id, safeMember);

  return res.json({ member: safeMember, message: `Updated ${member.name}'s membership record.` });
});

app.delete('/api/admin/members/:id', authenticate, requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { id } = req.params;

  if (id === adminUser.id) {
    return res.status(400).json({ error: 'You cannot delete your own administrator account.' });
  }

  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  const [removed] = db.users.splice(idx, 1);
  const removedApps = db.applications.filter((a) => a.userId === id);
  db.applications = db.applications.filter((a) => a.userId !== id);
  db.sessions = db.sessions.filter((s) => s.userId !== id);

  saveDatabase();
  deleteFromFirestore('users', id);
  for (const appRecord of removedApps) {
    deleteFromFirestore('applications', appRecord.id);
  }

  return res.json({ message: `Removed ${removed.name} from the member registry.` });
});

app.get('/api/admin/applications', authenticate, requireAdmin, (_req, res) => {
  const apps = [...db.applications].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  return res.json({ applications: apps });
});

app.post('/api/admin/applications/:id/review', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { action, tier, reviewNote = '' } = req.body;

  const application = db.applications.find((a) => a.id === id);
  if (!application) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (action !== 'approve' && action !== 'reject' && action !== 'decline') {
    return res.status(400).json({ error: 'Action must be "approve" or "reject".' });
  }

  const isApprove = action === 'approve';
  const now = new Date().toISOString();
  application.status = isApprove ? 'approved' : 'rejected';
  application.reviewedAt = now;
  application.reviewNote = String(reviewNote || '').trim().slice(0, 1024) || undefined;

  if (isApprove && ['Founding Circle', 'Executive', 'Patron', 'Associate'].includes(tier)) {
    application.tierRequested = tier;
  }

  const linkedUser = db.users.find((u) => u.id === application.userId);
  if (linkedUser) {
    if (isApprove) {
      linkedUser.membershipStatus = 'active';
      linkedUser.membershipTier = application.tierRequested;
      linkedUser.joinedAt = now;
      linkedUser.isPublicInDirectory = true;
      if (!linkedUser.memberNumber || linkedUser.memberNumber === 'BATB-PEND' || linkedUser.memberNumber === 'BATB-REJ') {
        linkedUser.memberNumber = generateUniqueMemberNumber();
      }
    } else {
      linkedUser.membershipStatus = 'rejected';
      linkedUser.memberNumber = 'BATB-REJ';
      linkedUser.isPublicInDirectory = false;
    }
    syncToFirestore('users', linkedUser.id, sanitizeUser(linkedUser));
  }

  saveDatabase();
  syncToFirestore('applications', application.id, application);

  return res.json({
    application,
    user: linkedUser ? sanitizeUser(linkedUser) : undefined,
    message: isApprove
      ? `Approved ${application.applicantName} into ${application.tierRequested} (${linkedUser?.memberNumber || 'Active'}).`
      : `Rejected application for ${application.applicantName}.`,
  });
});

// -------------------------------------------------------------
// Preserved Member Vault: Files & Portals Endpoints
// -------------------------------------------------------------

app.get('/api/files', authenticate, requireActiveMember, (req, res) => {
  const user = (req as any).user as User;
  const { category, search, portalId, sortBy = 'date_desc' } = req.query;

  let userFiles = db.files.filter((f) => {
    if (user.role === 'admin') return true;
    if (user.role === 'freelancer' || user.role === 'member') {
      return f.userId === user.id || f.uploadedBy === 'admin';
    }
    const userPortals = db.portals.filter((p) => p.clientEmail.toLowerCase() === user.email.toLowerCase());
    const portalIds = userPortals.map((p) => p.id);
    return f.userId === user.id || (f.portalId && portalIds.includes(f.portalId));
  });

  if (category && category !== 'all') {
    userFiles = userFiles.filter((f) => f.category === category);
  }

  if (portalId && portalId !== 'all') {
    userFiles = userFiles.filter((f) => f.portalId === portalId);
  }

  if (typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    userFiles = userFiles.filter(
      (f) =>
        f.originalName.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q)) ||
        f.uploaderName.toLowerCase().includes(q)
    );
  }

  userFiles.sort((a, b) => {
    if (sortBy === 'date_asc') return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    if (sortBy === 'name_asc') return a.originalName.localeCompare(b.originalName);
    if (sortBy === 'name_desc') return b.originalName.localeCompare(a.originalName);
    if (sortBy === 'size_desc') return b.size - a.size;
    if (sortBy === 'size_asc') return a.size - b.size;
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  return res.json({ files: userFiles });
});

app.post('/api/files/upload', authenticate, requireActiveMember, upload.array('files', 15), (req, res) => {
  const user = (req as any).user as User;
  const files = req.files as Express.Multer.File[];
  const { portalId, notes } = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files were attached for upload.' });
  }

  const uploadedRecords: StoredFile[] = [];

  for (const f of files) {
    const category = determineCategory(f.originalname, f.mimetype);
    const newFile: StoredFile = {
      id: `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      userId: user.id,
      portalId: portalId || undefined,
      originalName: f.originalname,
      storedName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: user.role === 'admin' ? 'admin' : 'member',
      uploaderName: user.name,
      notes: notes || '',
      category,
      isStarred: false,
    };

    db.files.unshift(newFile);
    uploadedRecords.push(newFile);
    syncToFirestore('files', newFile.id, newFile);
  }

  saveDatabase();

  return res.json({
    message: `Successfully uploaded ${uploadedRecords.length} ${uploadedRecords.length === 1 ? 'file' : 'files'}.`,
    files: uploadedRecords,
  });
});

app.get('/api/files/:id/download', (req, res) => {
  const { id } = req.params;
  const token = (req.query.token as string) || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '');

  const file = db.files.find((f) => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'Requested file was not found.' });
  }

  if (token) {
    const session = db.sessions.find((s) => s.token === token);
    const reqUser = session ? db.users.find((u) => u.id === session.userId) : undefined;
    if (!session || !reqUser) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!file.portalId && reqUser.role !== 'admin' && reqUser.membershipStatus !== 'active') {
      return res.status(403).json({ error: 'Active membership standing is required to download vault files.' });
    }
  } else if (!file.portalId) {
    return res.status(401).json({ error: 'Authentication required to download private vault files.' });
  }

  const filePath = path.join(UPLOADS_DIR, file.storedName);

  if (!fs.existsSync(filePath)) {
    const placeholder = Buffer.from(`BOY'S AT THE BACK Vault Document: ${file.originalName}\nUploaded: ${file.uploadDate}`);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    return res.send(placeholder);
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  return res.sendFile(filePath);
});

app.get('/api/files/:id/preview', (req, res) => {
  const { id } = req.params;
  const token = (req.query.token as string) || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '');

  const file = db.files.find((f) => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found.' });
  }

  if (token) {
    const session = db.sessions.find((s) => s.token === token);
    const reqUser = session ? db.users.find((u) => u.id === session.userId) : undefined;
    if (!session || !reqUser) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!file.portalId && reqUser.role !== 'admin' && reqUser.membershipStatus !== 'active') {
      return res.status(403).json({ error: 'Active membership standing is required to preview vault files.' });
    }
  } else if (!file.portalId) {
    return res.status(401).json({ error: 'Authentication required to preview private vault files.' });
  }

  const filePath = path.join(UPLOADS_DIR, file.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File content not found on server.' });
  }

  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
  return res.sendFile(filePath);
});

app.patch('/api/files/:id', authenticate, requireActiveMember, (req, res) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { notes, originalName, isStarred } = req.body;

  const file = db.files.find((f) => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found.' });
  }

  if (file.userId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied. You can only edit your own files.' });
  }

  if (notes !== undefined) file.notes = notes;
  if (originalName !== undefined && originalName.trim()) file.originalName = originalName.trim();
  if (isStarred !== undefined) file.isStarred = Boolean(isStarred);

  saveDatabase();
  syncToFirestore('files', file.id, file);
  return res.json({ file, message: 'File details updated.' });
});

app.delete('/api/files/:id', authenticate, requireActiveMember, (req, res) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  const fileIndex = db.files.findIndex((f) => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const file = db.files[fileIndex];

  if (file.userId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied. You can only delete your own files.' });
  }

  const filePath = path.join(UPLOADS_DIR, file.storedName);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Could not remove file from disk:', e);
    }
  }

  db.files.splice(fileIndex, 1);
  saveDatabase();
  deleteFromFirestore('files', file.id);

  return res.json({ message: `"${file.originalName}" was permanently deleted.` });
});

app.get('/api/portals', authenticate, requireActiveMember, (req, res) => {
  const user = (req as any).user as User;

  let portals: ClientPortal[];
  if (user.role === 'admin') {
    portals = db.portals;
  } else {
    portals = db.portals.filter(
      (p) => p.freelancerId === user.id || p.clientEmail.toLowerCase() === user.email.toLowerCase()
    );
  }

  const enriched = portals.map((p) => {
    const portalFiles = db.files.filter((f) => f.portalId === p.id);
    const totalSize = portalFiles.reduce((acc, curr) => acc + curr.size, 0);
    return {
      ...p,
      fileCount: portalFiles.length,
      totalSize,
    };
  });

  return res.json({ portals: enriched });
});

app.post('/api/portals', authenticate, requireActiveMember, (req, res) => {
  const user = (req as any).user as User;
  const { clientName, clientEmail, projectName, description } = req.body;

  if (!clientName || !projectName) {
    return res.status(400).json({ error: 'Please provide Recipient Name and Portal Title.' });
  }

  const slug = clientName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const code = `BATB-${slug || 'DROP'}-${randomSuffix}`;

  const newPortal: ClientPortal = {
    id: `portal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    freelancerId: user.id,
    code,
    clientName: clientName.trim(),
    clientEmail: (clientEmail || '').trim(),
    projectName: projectName.trim(),
    description: (description || '').trim(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.portals.unshift(newPortal);
  saveDatabase();
  syncToFirestore('portals', newPortal.id, newPortal);

  return res.json({
    portal: { ...newPortal, fileCount: 0, totalSize: 0 },
    message: 'Drop portal created successfully.',
  });
});

app.get('/api/portals/public/:code', (req, res) => {
  const { code } = req.params;
  const portal = db.portals.find((p) => p.code.toUpperCase() === code.toUpperCase());

  if (!portal) {
    return res.status(404).json({ error: 'Portal not found or expired link.' });
  }

  const freelancer = db.users.find((u) => u.id === portal.freelancerId);
  const portalFiles = db.files
    .filter((f) => f.portalId === portal.id)
    .map((f) => ({
      id: f.id,
      originalName: f.originalName,
      size: f.size,
      uploadDate: f.uploadDate,
      category: f.category,
      uploaderName: f.uploaderName,
      uploadedBy: f.uploadedBy,
      notes: f.notes,
    }));

  return res.json({
    portal: {
      id: portal.id,
      code: portal.code,
      clientName: portal.clientName,
      projectName: portal.projectName,
      description: portal.description,
      createdAt: portal.createdAt,
    },
    freelancer: {
      name: freelancer?.name || 'Member Host',
      company: freelancer?.company || 'BOY\'S AT THE BACK',
      avatarUrl: freelancer?.avatarUrl,
    },
    files: portalFiles,
  });
});

app.post('/api/portals/public/:code/upload', upload.array('files', 15), (req, res) => {
  const { code } = req.params;
  const { clientName, notes } = req.body;
  const files = req.files as Express.Multer.File[];

  const portal = db.portals.find((p) => p.code.toUpperCase() === code.toUpperCase());
  if (!portal) {
    return res.status(404).json({ error: 'Portal link invalid.' });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  const uploadedRecords: StoredFile[] = [];

  for (const f of files) {
    const category = determineCategory(f.originalname, f.mimetype);
    const newFile: StoredFile = {
      id: `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      userId: portal.freelancerId,
      portalId: portal.id,
      originalName: f.originalname,
      storedName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'client',
      uploaderName: clientName || portal.clientName || 'Guest Upload',
      notes: notes || '',
      category,
      isStarred: false,
    };

    db.files.unshift(newFile);
    uploadedRecords.push(newFile);
    syncToFirestore('files', newFile.id, newFile);
  }

  saveDatabase();

  return res.json({
    message: `Received ${uploadedRecords.length} file(s) for ${portal.projectName}.`,
    files: uploadedRecords,
  });
});

app.get('/api/stats', authenticate, requireActiveMember, (req, res) => {
  const user = (req as any).user as User;

  const userFiles = user.role === 'admin'
    ? db.files
    : db.files.filter((f) => f.userId === user.id || f.uploadedBy === 'admin');
  const totalBytes = userFiles.reduce((acc, curr) => acc + curr.size, 0);

  const categoryBreakdown = {
    image: userFiles.filter((f) => f.category === 'image').length,
    document: userFiles.filter((f) => f.category === 'document').length,
    design: userFiles.filter((f) => f.category === 'design').length,
    archive: userFiles.filter((f) => f.category === 'archive').length,
    other: userFiles.filter((f) => f.category === 'other').length,
  };

  return res.json({
    totalFiles: userFiles.length,
    totalBytes,
    totalBytesFormatted: `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`,
    quotaBytes: 2 * 1024 * 1024 * 1024,
    quotaPercentage: Math.min(100, (totalBytes / (2 * 1024 * 1024 * 1024)) * 100).toFixed(1),
    categoryBreakdown,
    clientUploads: userFiles.filter((f) => f.uploadedBy === 'client').length,
    freelancerUploads: userFiles.filter((f) => f.uploadedBy === 'freelancer' || f.uploadedBy === 'member').length,
    portalCount: db.portals.filter((p) => p.freelancerId === user.id || user.role === 'admin').length,
  });
});

app.get('/api/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

// -------------------------------------------------------------
// Frontend Vite Middleware & Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vitePromise = import('vite').then(({ createServer }) =>
      createServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      })
    );
    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BOY'S AT THE BACK backend & frontend ready at http://localhost:${PORT}`);
  });
}

startServer();
