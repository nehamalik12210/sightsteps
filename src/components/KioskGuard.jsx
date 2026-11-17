import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { hasKioskSessionExpired, KIOSK_IDLE_LIMIT_MS } from '../utils/kioskPolicy.js';

/** Clears shared-device sessions after inactivity and never writes data to a server. */
export default function KioskGuard() {
  const navigate = useNavigate();
  const { kioskMode, sessionId, reset } = useApp();

  useEffect(() => {
    if (!kioskMode || !sessionId) return undefined;
    let lastActivity = Date.now();
    let timer = null;
    let clearing = false;

    const clearIfIdle = async () => {
      const remaining = KIOSK_IDLE_LIMIT_MS - (Date.now() - lastActivity);
      if (remaining > 0) {
        timer = window.setTimeout(clearIfIdle, remaining);
        return;
      }
      if (clearing) return;
      clearing = true;
      const cleared = await reset();
      navigate(cleared ? '/kiosk?timeout=1' : '/kiosk?timeout=1&clearError=1', { replace: true });
    };

    const markActive = () => {
      const now = Date.now();
      if (hasKioskSessionExpired(lastActivity, now, KIOSK_IDLE_LIMIT_MS)) {
        void clearIfIdle();
        return;
      }
      lastActivity = now;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(clearIfIdle, KIOSK_IDLE_LIMIT_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (hasKioskSessionExpired(lastActivity, now, KIOSK_IDLE_LIMIT_MS)) {
        if (timer) window.clearTimeout(timer);
        void clearIfIdle();
        return;
      }
      // Returning to a still-valid visible session counts as activity.
      lastActivity = now;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(clearIfIdle, KIOSK_IDLE_LIMIT_MS);
    };

    ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((eventName) => {
      window.addEventListener(eventName, markActive, { passive: true });
    });
    document.addEventListener('visibilitychange', onVisibility);
    timer = window.setTimeout(clearIfIdle, KIOSK_IDLE_LIMIT_MS);

    return () => {
      if (timer) window.clearTimeout(timer);
      ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((eventName) => {
        window.removeEventListener(eventName, markActive);
      });
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [kioskMode, sessionId, reset, navigate]);

  return null;
}
