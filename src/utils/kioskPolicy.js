/** Shared-device policy helpers; pure functions are covered by the regression suite. */
export const KIOSK_IDLE_LIMIT_MS = 5 * 60 * 1000;

export function shouldDiscardKioskSessionOnRestore(record) {
  return Boolean(record?.kioskMode);
}

export function hasKioskSessionExpired(lastActivityAt, now = Date.now(), idleLimitMs = KIOSK_IDLE_LIMIT_MS) {
  if (!Number.isFinite(lastActivityAt) || !Number.isFinite(now) || !Number.isFinite(idleLimitMs) || idleLimitMs <= 0) return false;
  return now - lastActivityAt >= idleLimitMs;
}
