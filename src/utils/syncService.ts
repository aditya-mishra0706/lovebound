/**
 * Client sync service for connecting two different devices/people via the Express backend,
 * with real-time code verification and zero dummy fallback.
 */

import { syncManager } from './syncChannel';
const API_BASE_URL = 'https://lovebound.onrender.com';
export interface CoupleServerState {
  code: string;
  creator: any;
  partner?: any;
  shared: any;
  recentReactions: Array<{
    id: string;
    type: 'cheer' | 'nudge' | 'love';
    senderName: string;
    timestamp: number;
  }>;
  updatedAt: number;
}

export interface CheckCodeResult {
  valid: boolean;
  code?: string;
  coupleName?: string;
  togetherSince?: string;
  creatorName?: string;
  creatorAvatar?: string;
  alreadyHasPartner?: boolean;
  partnerName?: string | null;
  partnerAvatar?: string | null;
  error?: string;
}

class SyncService {
  private activeCode: string | null = null;
  private userRole: 'creator' | 'partner' = 'creator';
  private pollingTimer: NodeJS.Timeout | null = null;
  private lastKnownReactionId: string | null = null;
  private onStateUpdateCallback: ((state: CoupleServerState) => void) | null = null;
  private onReactionCallback: ((type: 'cheer' | 'nudge' | 'love', senderName: string) => void) | null = null;

  init(code: string, role: 'creator' | 'partner') {
    this.activeCode = code.trim().toUpperCase();
    this.userRole = role;
    this.startPolling();
  }

  stop() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.activeCode = null;
  }

  setListeners(
    onStateUpdate: (state: CoupleServerState) => void,
    onReaction: (type: 'cheer' | 'nudge' | 'love', senderName: string) => void
  ) {
    this.onStateUpdateCallback = onStateUpdate;
    this.onReactionCallback = onReaction;
  }

  // 1. Real-time verification of a code before joining
  async checkCode(code: string): Promise<CheckCodeResult> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, error: 'Please enter a pairing code.' };
    }

    try {
      const res = await fetch(
  `${API_BASE_URL}/api/sync/check/${encodeURIComponent(cleanCode)}`
);
      const data: CheckCodeResult = await res.json();
      return data;
    } catch (e: any) {
      return { valid: false, error: 'Could not connect to sync server. Please verify network connection.' };
    }
  }

  // 2. Fetch list of active rooms
  async getActiveRooms(): Promise<Array<{ code: string; coupleName: string; creatorName: string; hasPartner: boolean }>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sync/active-codes`);
      const data = await res.json();
      return data.rooms || [];
    } catch {
      return [];
    }
  }

  // 3. Register couple room on server
  async registerCouple(
    code: string,
    user: any,
    coupleName: string,
    togetherSince: string,
    additional?: {
      goals?: any[];
      sharedTasks?: any[];
      milestones?: any[];
      memories?: any[];
      settings?: any;
    }
  ) {
    this.activeCode = code.trim().toUpperCase();
    this.userRole = 'creator';
    try {
      const res = await fetch(`${API_BASE_URL}/api/sync/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: this.activeCode,
          user,
          coupleName,
          togetherSince,
          ...additional,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Registration failed');
      }
      const data = await res.json();
      this.startPolling();
      return data;
    } catch (e: any) {
      console.error('Server sync register error:', e);
      throw e;
    }
  }

  // 4. Partner joins room using code (STRICT VALIDATION)
  async joinCouple(code: string, partner: any) {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`${API_BASE_URL}/api/sync/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, partner }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Code "${cleanCode}" is invalid. Please double check with your partner.`);
      }

      this.activeCode = cleanCode;
      this.userRole = 'partner';
      this.startPolling();

      // Broadcast to local tabs if open on same machine
      syncManager.send({
        type: 'PAIR_REQUEST',
        senderCode: cleanCode,
        targetCode: cleanCode,
        senderName: partner.name,
      });

      return data;
    } catch (e: any) {
      console.error('Server sync join error:', e);
      throw e;
    }
  }

  // 5. Push local changes to server
  async pushUpdate(payload: {
    userRole?: 'creator' | 'partner';
    userState?: any;
    shared?: any;
    reaction?: { type: 'cheer' | 'nudge' | 'love'; senderName: string };
  }) {
    if (!this.activeCode) return;

    const role = payload.userRole || this.userRole;

    try {
     await fetch(`${API_BASE_URL}/api/sync/push/${encodeURIComponent(this.activeCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: role,
          ...payload,
        }),
      });
    } catch (e) {
      console.warn('Sync push error:', e);
    }

    // Also broadcast to other local tabs if open on same machine
    if (payload.reaction) {
      syncManager.send({
        type: payload.reaction.type === 'cheer' ? 'CHEER_SENT' : payload.reaction.type === 'love' ? 'LOVE_SENT' : 'NUDGE_SENT',
        senderCode: this.activeCode,
        senderName: payload.reaction.senderName,
      });
    }
  }

  // 6. Background polling (every 2.5s)
  private startPolling() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);

    const poll = async () => {
      if (!this.activeCode) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/sync/pull/${encodeURIComponent(this.activeCode)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.found && data.couple) {
          const couple: CoupleServerState = data.couple;

          // Check for new reactions
          if (couple.recentReactions && couple.recentReactions.length > 0) {
            const latest = couple.recentReactions[couple.recentReactions.length - 1];
            if (latest.id !== this.lastKnownReactionId) {
              this.lastKnownReactionId = latest.id;
              if (Date.now() - latest.timestamp < 12000) {
                this.onReactionCallback?.(latest.type, latest.senderName);
              }
            }
          }

          this.onStateUpdateCallback?.(couple);
        }
      } catch (e) {
        // Silent fail on momentary network glitches
      }
    };

    poll();
    this.pollingTimer = setInterval(poll, 2500);
  }
}

export const syncService = new SyncService();
