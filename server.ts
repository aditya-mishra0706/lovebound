import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CoupleSession {
  code: string;
  creator: {
    id: string; // 'creator'
    name: string;
    avatar: string;
    email: string;
    streakDays: number;
    statusText: string;
    isDeepWork: boolean;
    focusMinutesToday: number;
    tasks: any[];
  };
  partner?: {
    id: string; // 'partner'
    name: string;
    avatar: string;
    email: string;
    streakDays: number;
    statusText: string;
    isDeepWork: boolean;
    focusMinutesToday: number;
    tasks: any[];
  };
  shared: {
    coupleName: string;
    togetherSince: string;
    sharedTasks: any[];
    goals: any[];
    milestones: any[];
    memories: any[];
    tree: any;
    settings: any;
  };
  recentReactions: Array<{
    id: string;
    type: 'cheer' | 'nudge' | 'love';
    senderName: string;
    timestamp: number;
  }>;
  updatedAt: number;
}

// Disk persistence file path
const DATA_DIR = path.resolve(__dirname, '.data');
const DATA_FILE = path.resolve(DATA_DIR, 'couples.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir:', e);
  }
}

// In-memory sync store keyed by normalized couple code
const couplesMap = new Map<string, CoupleSession>();

// Code normalizer helper: handles lowercase, dashes, spaces (e.g. 'duo 1234' -> 'DUO-1234')
export function normalizeCodeKey(rawCode: string): string {
  if (!rawCode) return '';
  const trimmed = rawCode.trim().toUpperCase().replace(/\s+/g, '');
  if (trimmed.includes('-')) return trimmed;
  // If user entered letters + digits without dash (e.g. DUO1234 or LOVE8291)
  const match = trimmed.match(/^(DUO|LOVE|HEART|PAIR|MINT|[A-Z]{3,4})(\d.*)$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return trimmed;
}

// Load from disk on startup
function loadCouplesFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data: Record<string, CoupleSession> = JSON.parse(raw);
      Object.entries(data).forEach(([code, session]) => {
        const canonicalKey = normalizeCodeKey(code);
        couplesMap.set(canonicalKey, session);
      });
      console.log(`Loaded ${couplesMap.size} couples sessions from disk.`);
    }
  } catch (e) {
    console.error('Error loading couples from disk:', e);
  }
}

// Save to disk helper
function saveCouplesToDisk() {
  try {
    const obj: Record<string, CoupleSession> = {};
    couplesMap.forEach((session, key) => {
      obj[key] = session;
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving couples to disk:', e);
  }
}

// Find couple by flexible code matching
function findCoupleByCode(inputCode: string): { key: string; session: CoupleSession } | null {
  if (!inputCode) return null;
  const canonical = normalizeCodeKey(inputCode);
  if (couplesMap.has(canonical)) {
    return { key: canonical, session: couplesMap.get(canonical)! };
  }

  // Fallback: match without hyphen
  const strippedInput = inputCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  for (const [k, session] of couplesMap.entries()) {
    const strippedStored = k.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (strippedStored === strippedInput) {
      return { key: k, session };
    }
  }
  return null;
}

loadCouplesFromDisk();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '35mb' }));

  // --- API ROUTES FOR CROSS-DEVICE TWO-PERSON SYNC ---

  // 1. Verify if a pairing code exists and return partner/creator details
  app.get('/api/sync/check/:code', (req: Request, res: Response) => {
    try {
      const rawCode = String(req.params.code);
      const found = findCoupleByCode(rawCode);

      if (!found) {
        return res.json({
          valid: false,
          code: normalizeCodeKey(rawCode),
          error: `Pairing code "${rawCode.trim().toUpperCase()}" was not found. Please verify the code displayed on your partner's phone.`,
        });
      }

      const couple = found.session;
      return res.json({
        valid: true,
        code: couple.code,
        coupleName: couple.shared.coupleName,
        togetherSince: couple.shared.togetherSince,
        creatorName: couple.creator.name,
        creatorAvatar: couple.creator.avatar,
        alreadyHasPartner: !!couple.partner,
        partnerName: couple.partner?.name || null,
        partnerAvatar: couple.partner?.avatar || null,
      });
    } catch (err: any) {
      console.error('Error in /api/sync/check:', err);
      return res.status(500).json({ valid: false, error: err.message });
    }
  });

  // 2. List active room codes (useful for partner reference)
  app.get('/api/sync/active-codes', (_req: Request, res: Response) => {
    try {
      const codes = Array.from(couplesMap.values()).map((c) => ({
        code: c.code,
        coupleName: c.shared.coupleName,
        creatorName: c.creator.name,
        hasPartner: !!c.partner,
      }));
      return res.json({ count: codes.length, rooms: codes });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. Register or update a couple code session
  app.post('/api/sync/register', (req: Request, res: Response) => {
    try {
      const { code, user, coupleName, togetherSince, goals, sharedTasks, milestones, memories, settings } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Pairing code is required' });
      }

      const canonicalCode = normalizeCodeKey(code);
      const existing = findCoupleByCode(canonicalCode);

      let couple: CoupleSession;

      if (!existing) {
        couple = {
          code: canonicalCode,
          creator: {
            id: 'creator',
            name: user?.name?.trim() || 'Partner 1',
            avatar: user?.avatar || '🦋',
            email: user?.email?.trim() || '',
            streakDays: user?.streakDays || 1,
            statusText: user?.statusText || 'Connected & in love',
            isDeepWork: false,
            focusMinutesToday: 0,
            tasks: user?.tasks || [],
          },
          shared: {
            coupleName: coupleName?.trim() || `${user?.name || 'Our'} Couple 🍯`,
            togetherSince: togetherSince || new Date().toISOString().split('T')[0],
            sharedTasks: sharedTasks || [],
            goals: goals || [],
            milestones: milestones || [],
            memories: memories || [],
            tree: { level: 1, points: 15, maxPoints: 100, stageName: 'Growing beautifully! 🌿', waterCountToday: 0 },
            settings: settings || {
              coupleName: coupleName?.trim() || 'Sweethearts 🍯',
              togetherSince: togetherSince || new Date().toISOString().split('T')[0],
              theme: 'cosmic',
              celebrationFx: 'confetti',
              cheersAndNudges: true,
              partnerActivityAlerts: true,
              soundAndHaptics: true,
              language: 'English',
            },
          },
          recentReactions: [],
          updatedAt: Date.now(),
        };
        couplesMap.set(canonicalCode, couple);
      } else {
        couple = existing.session;
        if (user) {
          couple.creator = {
            ...couple.creator,
            name: user.name?.trim() || couple.creator.name,
            avatar: user.avatar || couple.creator.avatar,
            email: user.email !== undefined ? user.email : couple.creator.email,
            statusText: user.statusText || couple.creator.statusText,
          };
        }
        if (coupleName) couple.shared.coupleName = coupleName.trim();
        if (togetherSince) couple.shared.togetherSince = togetherSince;
        if (goals !== undefined) couple.shared.goals = goals;
        if (sharedTasks !== undefined) couple.shared.sharedTasks = sharedTasks;
        if (milestones !== undefined) couple.shared.milestones = milestones;
        if (memories !== undefined) couple.shared.memories = memories;
        couple.updatedAt = Date.now();
      }

      saveCouplesToDisk();
      return res.json({ success: true, couple });
    } catch (err: any) {
      console.error('Error in /api/sync/register:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Partner joins using the creator's code (VALIDATION ENFORCED)
  app.post('/api/sync/join', (req: Request, res: Response) => {
    try {
      const { code, partner } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, error: 'Pairing code is required.' });
      }

      const found = findCoupleByCode(code);
      if (!found) {
        return res.status(404).json({
          success: false,
          error: `Pairing code "${String(code).trim().toUpperCase()}" does not exist. Please ask your partner for the exact code shown on their screen.`,
        });
      }

      if (!partner?.name || !partner.name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your name so your partner knows who joined.',
        });
      }

      const couple = found.session;

      // Attach real partner data
      couple.partner = {
        id: 'partner',
        name: partner.name.trim(),
        avatar: partner.avatar || '🌸',
        email: partner.email?.trim() || '',
        streakDays: 1,
        statusText: 'Paired & online',
        isDeepWork: false,
        focusMinutesToday: 0,
        tasks: partner.tasks || [],
      };
      couple.updatedAt = Date.now();

      // Push celebratory reaction for creator's screen to notify immediately
      couple.recentReactions.push({
        id: `rx-pair-${Date.now()}`,
        type: 'love',
        senderName: partner.name.trim(),
        timestamp: Date.now(),
      });

      saveCouplesToDisk();
      return res.json({ success: true, couple });
    } catch (err: any) {
      console.error('Error in /api/sync/join:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Pull latest couple state (polled by both phones every 2-3s)
  app.get('/api/sync/pull/:code', (req: Request, res: Response) => {
    try {
      const found = findCoupleByCode(req.params.code);
      if (!found) {
        return res.json({ found: false });
      }

      return res.json({
        found: true,
        couple: found.session,
        serverTime: Date.now(),
      });
    } catch (err: any) {
      console.error('Error in /api/sync/pull:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. Push updates (tasks, goals, memories, tree, reactions)
  app.post('/api/sync/push/:code', (req: Request, res: Response) => {
    try {
      const found = findCoupleByCode(req.params.code);
      if (!found) {
        return res.status(404).json({ error: 'Couple room not found' });
      }

      const couple = found.session;
      const { userRole, userState, shared, reaction } = req.body;

      if (userRole === 'creator' && userState) {
        couple.creator = { ...couple.creator, ...userState };
      } else if (userRole === 'partner' && userState) {
        if (!couple.partner) {
          couple.partner = {
            id: 'partner',
            name: userState.name || 'Partner',
            avatar: userState.avatar || '🌸',
            email: userState.email || '',
            streakDays: 1,
            statusText: 'Paired & online',
            isDeepWork: false,
            focusMinutesToday: 0,
            tasks: [],
            ...userState,
          };
        } else {
          couple.partner = { ...couple.partner, ...userState };
        }
      }

      if (shared) {
        if (shared.sharedTasks !== undefined) couple.shared.sharedTasks = shared.sharedTasks;
        if (shared.goals !== undefined) couple.shared.goals = shared.goals;
        if (shared.milestones !== undefined) couple.shared.milestones = shared.milestones;
        if (shared.memories !== undefined) couple.shared.memories = shared.memories;
        if (shared.tree !== undefined) couple.shared.tree = { ...couple.shared.tree, ...shared.tree };
        if (shared.coupleName !== undefined) couple.shared.coupleName = shared.coupleName;
        if (shared.togetherSince !== undefined) couple.shared.togetherSince = shared.togetherSince;
        if (shared.settings !== undefined) couple.shared.settings = { ...couple.shared.settings, ...shared.settings };
      }

      if (reaction) {
        couple.recentReactions.push({
          id: `rx-${Date.now()}-${Math.random()}`,
          type: reaction.type,
          senderName: reaction.senderName,
          timestamp: Date.now(),
        });
        if (couple.recentReactions.length > 25) {
          couple.recentReactions = couple.recentReactions.slice(-25);
        }
      }

      couple.updatedAt = Date.now();
      saveCouplesToDisk();
      return res.json({ success: true, couple });
    } catch (err: any) {
      console.error('Error in /api/sync/push:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- VITE OR STATIC ASSETS SERVING ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Duo Server listening on port ${PORT}`);
  });
}

startServer();
