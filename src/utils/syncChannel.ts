/**
 * Cross-tab and live sync manager for partner syncing.
 * Uses BroadcastChannel with localStorage fallback.
 */

export interface SyncMessage {
  type: 'PAIR_REQUEST' | 'PAIR_CONFIRMED' | 'CHEER_SENT' | 'NUDGE_SENT' | 'LOVE_SENT' | 'DATA_UPDATE';
  senderCode: string;
  targetCode?: string;
  senderName: string;
  payload?: any;
  timestamp: number;
}

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('duo_couple_sync_channel');
        this.channel.onmessage = (event) => {
          this.handleIncoming(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or blocked:', e);
      }
    }

    // Storage event fallback for older browsers or cross-window
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'duo_live_sync_ping' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handleIncoming(data);
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private handleIncoming(msg: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  send(msg: Omit<SyncMessage, 'timestamp'>) {
    const fullMsg: SyncMessage = {
      ...msg,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(fullMsg);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('duo_live_sync_ping', JSON.stringify(fullMsg));
      } catch {
        // Ignore storage errors
      }
    }
  }

  subscribe(listener: (msg: SyncMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const syncManager = new SyncManager();
