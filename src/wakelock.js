/**
 * Screen Wake Lock API Controller
 * Keeps mobile and tablet screens awake during active workout sessions.
 */
class WakeLockController {
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;
    this.isActive = false;
    this.onStatusChange = null;

    if (this.isSupported) {
      document.addEventListener('visibilitychange', async () => {
        if (this.wakeLock !== null && document.visibilityState === 'visible') {
          await this.request();
        }
      });
    }
  }

  async request() {
    if (!this.isSupported) {
      this.updateStatus(false);
      return false;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
        this.updateStatus(false);
      });
      this.updateStatus(true);
      return true;
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      this.updateStatus(false);
      return false;
    }
  }

  release() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
    this.updateStatus(false);
  }

  updateStatus(active) {
    this.isActive = active;
    if (typeof this.onStatusChange === 'function') {
      this.onStatusChange(active, this.isSupported);
    }
  }
}

export const wakeLockController = new WakeLockController();
