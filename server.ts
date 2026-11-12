import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';

const app = express();
const PORT = process.env.PORT || 3000;

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

// Firestore async sync helper
async function syncToFirestore(collectionName: string, id: string, data: any) {
  if (!firestoreDb) return;
  try {
    await setDoc(doc(firestoreDb, collectionName, id), data, { merge: true });
  } catch (e) {
    // Keep local operation going even if network has brief latency
  }
}

async function deleteFromFirestore(collectionName: string, id: string) {
  if (!firestoreDb) return;
  try {
    await deleteDoc(doc(firestoreDb, collectionName, id));
  } catch (e) {
    // non-blocking
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'freelancer' | 'client';
  company: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClientPortal {
  id: string;
  freelancerId: string;
  code: string; // e.g. 'TB-ACME-2026'
  clientName: string;
  clientEmail: string;
  projectName: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface StoredFile {
  id: string;
  userId: string; // owner (freelancer)
  portalId?: string; // portal associated if any
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

export interface Session {
  token: string;
  userId: string;
  createdAt: number;
}

interface DatabaseSchema {
  users: User[];
  portals: ClientPortal[];
  files: StoredFile[];
  sessions: Session[];
}

// Helper: Password hashing
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
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

// Seed initial state
function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data.users && data.files) return data;
    } catch {
      // fallback
    }
  }

  const salt1 = crypto.randomBytes(16).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');

  const freelancerId = 'user_freelancer_1';
  const clientId = 'user_client_1';

  const initialUsers: User[] = [
    {
      id: freelancerId,
      email: 'designer@tambyus.com',
      passwordHash: hashPassword('password123', salt1),
      salt: salt1,
      name: 'Elena Rostova',
      role: 'freelancer',
      company: 'Studio Rostova',
      avatarUrl: '/src/assets/images/avatar_designer_1794475769293.jpg',
      createdAt: '2026-10-01T08:00:00.000Z',
    },
    {
      id: clientId,
      email: 'client@acmelabs.io',
      passwordHash: hashPassword('password123', salt2),
      salt: salt2,
      name: 'Marcus Vance',
      role: 'client',
      company: 'Acme Innovations',
      avatarUrl: '/src/assets/images/avatar_client_1794475781352.jpg',
      createdAt: '2026-10-15T09:30:00.000Z',
    },
  ];

  const portal1: ClientPortal = {
    id: 'portal_acme_1',
    freelancerId: freelancerId,
    code: 'TB-ACME-2026',
    clientName: 'Acme Innovations',
    clientEmail: 'client@acmelabs.io',
    projectName: 'Brand Identity & Design System',
    description: 'Please upload vector logo variants, brand deck references, high-res photography, and approved copy.',
    status: 'active',
    createdAt: '2026-10-16T10:00:00.000Z',
  };

  const portal2: ClientPortal = {
    id: 'portal_launch_2',
    freelancerId: freelancerId,
    code: 'TB-LAUNCH-884',
    clientName: 'Veloce Dynamics',
    clientEmail: 'team@velocedynamics.com',
    projectName: 'Q4 Product Showcase Web Portal',
    description: 'Upload 3D renders, CAD specifications, and video press releases for the upcoming launch.',
    status: 'active',
    createdAt: '2026-11-01T14:20:00.000Z',
  };

  // Create sample dummy files in uploads directory so they can be downloaded immediately
  const sampleFilesData: StoredFile[] = [
    {
      id: 'file_seed_1',
      userId: freelancerId,
      portalId: portal1.id,
      originalName: 'Acme_Brand_Identity_Guidelines_v2.pdf',
      storedName: 'sample_guidelines.pdf',
      mimeType: 'application/pdf',
      size: 3420800, // 3.4 MB
      uploadDate: '2026-11-10T11:24:00.000Z',
      uploadedBy: 'freelancer',
      uploaderName: 'Elena Rostova',
      notes: 'Final revised corporate brand guidelines including color palettes & typography specs.',
      category: 'document',
      isStarred: true,
    },
    {
      id: 'file_seed_2',
      userId: freelancerId,
      portalId: portal1.id,
      originalName: 'Vector_Master_Logo_Suite.svg',
      storedName: 'sample_logo.svg',
      mimeType: 'image/svg+xml',
      size: 485120, // 485 KB
      uploadDate: '2026-11-10T14:15:00.000Z',
      uploadedBy: 'client',
      uploaderName: 'Marcus Vance (Client)',
      notes: 'Exported from Illustrator. Includes primary horizontal and stacked lockups in RGB/CMYK.',
      category: 'image',
      isStarred: true,
    },
    {
      id: 'file_seed_3',
      userId: freelancerId,
      portalId: portal1.id,
      originalName: 'Studio_Packaging_Render_4K.png',
      storedName: 'sample_render.png',
      mimeType: 'image/png',
      size: 5120400, // 5.1 MB
      uploadDate: '2026-11-11T09:40:00.000Z',
      uploadedBy: 'freelancer',
      uploaderName: 'Elena Rostova',
      notes: 'Photorealistic matte foil packaging preview for client sign-off before manufacturing run.',
      category: 'image',
      isStarred: false,
    },
    {
      id: 'file_seed_4',
      userId: freelancerId,
      portalId: portal1.id,
      originalName: 'Product_Packaging_DieCut_Template.ai',
      storedName: 'sample_diecut.ai',
      mimeType: 'application/postscript',
      size: 14200300, // 14.2 MB
      uploadDate: '2026-11-11T16:05:00.000Z',
      uploadedBy: 'client',
      uploaderName: 'Marcus Vance (Client)',
      notes: 'Supplied by printing partner. 300 DPI bleed with spot UV layers.',
      category: 'design',
      isStarred: false,
    },
    {
      id: 'file_seed_5',
      userId: freelancerId,
      portalId: portal2.id,
      originalName: 'Typography_Editorial_Font_Package.zip',
      storedName: 'sample_fonts.zip',
      mimeType: 'application/zip',
      size: 18450000, // 18.4 MB
      uploadDate: '2026-11-12T04:10:00.000Z',
      uploadedBy: 'freelancer',
      uploaderName: 'Elena Rostova',
      notes: 'Licensed web fonts (WOFF2 + TTF) for development handover.',
      category: 'archive',
      isStarred: false,
    },
  ];

  // Write mock physical files into data/uploads
  for (const f of sampleFilesData) {
    const filePath = path.join(UPLOADS_DIR, f.storedName);
    if (!fs.existsSync(filePath)) {
      if (f.originalName.endsWith('.svg')) {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
          <rect width="400" height="120" rx="16" fill="#0B1528"/>
          <circle cx="60" cy="60" r="28" fill="#3B82F6"/>
          <path d="M50 48 L70 48 L60 72 Z" fill="#FFFFFF"/>
          <text x="110" y="70" fill="#FFFFFF" font-family="sans-serif" font-size="28" font-weight="bold">TamBuys Brand</text>
        </svg>`;
        fs.writeFileSync(filePath, svgContent, 'utf-8');
      } else {
        const sampleBuffer = Buffer.alloc(Math.min(f.size, 1024 * 16));
        sampleBuffer.fill(f.originalName);
        fs.writeFileSync(filePath, sampleBuffer);
      }
    }
  }

  const db: DatabaseSchema = {
    users: initialUsers,
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

// Auth Middleware: verifies token in Authorization header or query param
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

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

// Sign Up
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role = 'freelancer', company = '' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide email, password, and your name.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const newUser: User = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: normalizedEmail,
    passwordHash: hashPassword(password, salt),
    salt,
    name: name.trim(),
    role: role === 'client' ? 'client' : 'freelancer',
    company: company.trim() || (role === 'client' ? 'Client Org' : 'Independent Creative'),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    userId: newUser.id,
    createdAt: Date.now(),
  });

  saveDatabase();

  const { passwordHash: _, salt: __, ...safeUser } = newUser;
  syncToFirestore('users', newUser.id, safeUser);
  return res.json({
    token,
    user: safeUser,
    message: 'Account created successfully.',
  });
});

// Sign In
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

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({
    token,
    user: safeUser,
    message: 'Welcome back!',
  });
});

// Sign Out
app.post('/api/auth/logout', authenticate, (req, res) => {
  const user = (req as any).user as User;
  db.sessions = db.sessions.filter((s) => s.userId !== user.id);
  saveDatabase();
  return res.json({ message: 'Signed out successfully.' });
});

// Get Current User
app.get('/api/auth/me', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// -------------------------------------------------------------
// Files Endpoints (Protected by User ID isolation)
// -------------------------------------------------------------

// List Files for logged-in user
app.get('/api/files', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const { category, search, portalId, sortBy = 'date_desc' } = req.query;

  // Security rule: each user only sees files they own or their client portal files
  let userFiles = db.files.filter((f) => {
    if (user.role === 'freelancer') {
      return f.userId === user.id;
    } else {
      // client can see files in portals associated with them
      const userPortals = db.portals.filter((p) => p.clientEmail.toLowerCase() === user.email.toLowerCase());
      const portalIds = userPortals.map((p) => p.id);
      return f.userId === user.id || (f.portalId && portalIds.includes(f.portalId));
    }
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

  // Sorting
  userFiles.sort((a, b) => {
    if (sortBy === 'date_asc') return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    if (sortBy === 'name_asc') return a.originalName.localeCompare(b.originalName);
    if (sortBy === 'name_desc') return b.originalName.localeCompare(a.originalName);
    if (sortBy === 'size_desc') return b.size - a.size;
    if (sortBy === 'size_asc') return a.size - b.size;
    // default date_desc
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  return res.json({ files: userFiles });
});

// Upload Files (Single or Multiple)
app.post('/api/files/upload', authenticate, upload.array('files', 15), (req, res) => {
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
      userId: user.role === 'freelancer' ? user.id : (portalId ? db.portals.find((p) => p.id === portalId)?.freelancerId || user.id : user.id),
      portalId: portalId || undefined,
      originalName: f.originalname,
      storedName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: user.role,
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

// Download File
app.get('/api/files/:id/download', (req, res) => {
  const { id } = req.params;
  const token = (req.query.token as string) || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '');

  // Look up file
  const file = db.files.find((f) => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'Requested file was not found.' });
  }

  // Security check: if token provided or public portal token
  if (token) {
    const session = db.sessions.find((s) => s.token === token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
  }

  const filePath = path.join(UPLOADS_DIR, file.storedName);

  if (!fs.existsSync(filePath)) {
    // Generate sample buffer on the fly if needed
    const placeholder = Buffer.from(`TamBuys Secure Stored File: ${file.originalName}\nUploaded: ${file.uploadDate}`);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    return res.send(placeholder);
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  return res.sendFile(filePath);
});

// Inline Preview File
app.get('/api/files/:id/preview', (req, res) => {
  const { id } = req.params;
  const file = db.files.find((f) => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const filePath = path.join(UPLOADS_DIR, file.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File content not found on server.' });
  }

  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
  return res.sendFile(filePath);
});

// Update File Notes or Details
app.patch('/api/files/:id', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { notes, originalName, isStarred } = req.body;

  const file = db.files.find((f) => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found.' });
  }

  // Security rule: must own the file
  if (file.userId !== user.id) {
    return res.status(403).json({ error: 'Permission denied. You can only edit your own files.' });
  }

  if (notes !== undefined) file.notes = notes;
  if (originalName !== undefined && originalName.trim()) file.originalName = originalName.trim();
  if (isStarred !== undefined) file.isStarred = Boolean(isStarred);

  saveDatabase();
  syncToFirestore('files', file.id, file);
  return res.json({ file, message: 'File details updated.' });
});

// Delete File (Safe and Secure)
app.delete('/api/files/:id', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  const fileIndex = db.files.findIndex((f) => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const file = db.files[fileIndex];

  // Security rule: only the file owner can delete it
  if (file.userId !== user.id) {
    return res.status(403).json({ error: 'Permission denied. You can only delete files in your portal.' });
  }

  // Remove physical file from disk
  const filePath = path.join(UPLOADS_DIR, file.storedName);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Could not remove file from disk:', e);
    }
  }

  // Remove from database
  db.files.splice(fileIndex, 1);
  saveDatabase();
  deleteFromFirestore('files', file.id);

  return res.json({ message: `"${file.originalName}" was permanently deleted.` });
});

// -------------------------------------------------------------
// Client Portals Endpoints (Freelancers create links for clients)
// -------------------------------------------------------------

// Get Portals for current user
app.get('/api/portals', authenticate, (req, res) => {
  const user = (req as any).user as User;

  let portals: ClientPortal[];
  if (user.role === 'freelancer') {
    portals = db.portals.filter((p) => p.freelancerId === user.id);
  } else {
    portals = db.portals.filter((p) => p.clientEmail.toLowerCase() === user.email.toLowerCase());
  }

  // Enrich with file counts & total size
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

// Create a new client portal
app.post('/api/portals', authenticate, (req, res) => {
  const user = (req as any).user as User;
  const { clientName, clientEmail, projectName, description } = req.body;

  if (!clientName || !projectName) {
    return res.status(400).json({ error: 'Please provide Client Name and Project Name.' });
  }

  // Generate unique clean portal code e.g. TB-ACME-492
  const slug = clientName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const code = `TB-${slug || 'PORTAL'}-${randomSuffix}`;

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

  return res.json({
    portal: { ...newPortal, fileCount: 0, totalSize: 0 },
    message: 'Client portal created successfully.',
  });
});

// Public Portal View (For clients uploading via shared link without needing full account)
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
      name: freelancer?.name || 'Designer',
      company: freelancer?.company || 'Design Studio',
      avatarUrl: freelancer?.avatarUrl,
    },
    files: portalFiles,
  });
});

// Public Portal Upload (Client uploads directly to designer's portal)
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
      uploaderName: clientName || portal.clientName || 'Client Upload',
      notes: notes || '',
      category,
      isStarred: false,
    };

    db.files.unshift(newFile);
    uploadedRecords.push(newFile);
  }

  saveDatabase();

  return res.json({
    message: `Received ${uploadedRecords.length} file(s) for ${portal.projectName}.`,
    files: uploadedRecords,
  });
});

// -------------------------------------------------------------
// Dashboard Statistics & Storage Summary
// -------------------------------------------------------------
app.get('/api/stats', authenticate, (req, res) => {
  const user = (req as any).user as User;

  const userFiles = db.files.filter((f) => f.userId === user.id);
  const totalBytes = userFiles.reduce((acc, curr) => acc + curr.size, 0);

  const categoryBreakdown = {
    image: userFiles.filter((f) => f.category === 'image').length,
    document: userFiles.filter((f) => f.category === 'document').length,
    design: userFiles.filter((f) => f.category === 'design').length,
    archive: userFiles.filter((f) => f.category === 'archive').length,
    other: userFiles.filter((f) => f.category === 'other').length,
  };

  const clientUploads = userFiles.filter((f) => f.uploadedBy === 'client').length;
  const freelancerUploads = userFiles.filter((f) => f.uploadedBy === 'freelancer').length;

  return res.json({
    totalFiles: userFiles.length,
    totalBytes,
    totalBytesFormatted: `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`,
    quotaBytes: 2 * 1024 * 1024 * 1024, // 2 GB free tier
    quotaPercentage: Math.min(100, (totalBytes / (2 * 1024 * 1024 * 1024)) * 100).toFixed(1),
    categoryBreakdown,
    clientUploads,
    freelancerUploads,
    portalCount: db.portals.filter((p) => p.freelancerId === user.id).length,
  });
});

// -------------------------------------------------------------
// Frontend Vite Middleware & Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`TamBuys backend & frontend ready at http://localhost:${PORT}`);
  });
}

startServer();
