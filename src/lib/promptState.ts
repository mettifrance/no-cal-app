// Manages anti-annoyance state for install and notification prompts

const STORAGE_KEYS = {
  hasSeenInstallPrompt: 'nmc_hasSeenInstallPrompt',
  dismissedInstallPromptAt: 'nmc_dismissedInstallPromptAt',
  isInstalled: 'nmc_isInstalled',
  hasSeenNotificationPrompt: 'nmc_hasSeenNotificationPrompt',
  dismissedNotificationPromptAt: 'nmc_dismissedNotificationPromptAt',
  notificationsPermission: 'nmc_notificationsPermission',
  sessionInstallShown: 'nmc_sessionInstallShown',
  sessionNotificationShown: 'nmc_sessionNotificationShown',
} as const;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ---- Platform detection ----

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const displayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as any).standalone === true;
  return displayStandalone || iosStandalone;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// ---- Install prompt state ----

export function markInstallPromptSeen(): void {
  sessionStorage.setItem(STORAGE_KEYS.sessionInstallShown, 'true');
  localStorage.setItem(STORAGE_KEYS.hasSeenInstallPrompt, 'true');
}

export function dismissInstallPrompt(): void {
  markInstallPromptSeen();
  localStorage.setItem(STORAGE_KEYS.dismissedInstallPromptAt, Date.now().toString());
}

export function markInstalled(): void {
  localStorage.setItem(STORAGE_KEYS.isInstalled, 'true');
}

export function shouldShowInstallPrompt(totalCheckIns: number): boolean {
  // Not enough check-ins
  if (totalCheckIns < 2) return false;

  // Already installed / standalone
  if (isStandalone()) {
    markInstalled();
    return false;
  }
  if (localStorage.getItem(STORAGE_KEYS.isInstalled) === 'true') return false;

  // Already shown this session
  if (sessionStorage.getItem(STORAGE_KEYS.sessionInstallShown) === 'true') return false;

  // Dismissed within 7 days
  const dismissedAt = localStorage.getItem(STORAGE_KEYS.dismissedInstallPromptAt);
  if (dismissedAt && Date.now() - Number(dismissedAt) < SEVEN_DAYS_MS) return false;

  return true;
}

// ---- Notification prompt state ----

export function markNotificationPromptSeen(): void {
  sessionStorage.setItem(STORAGE_KEYS.sessionNotificationShown, 'true');
  localStorage.setItem(STORAGE_KEYS.hasSeenNotificationPrompt, 'true');
}

export function dismissNotificationPrompt(): void {
  markNotificationPromptSeen();
  localStorage.setItem(STORAGE_KEYS.dismissedNotificationPromptAt, Date.now().toString());
}

export function setNotificationsPermission(permission: string): void {
  localStorage.setItem(STORAGE_KEYS.notificationsPermission, permission);
}

export function getStoredNotificationsPermission(): string | null {
  return localStorage.getItem(STORAGE_KEYS.notificationsPermission);
}

export function shouldShowNotificationPrompt(totalCheckIns: number): boolean {
  if (totalCheckIns < 2) return false;

  // On iOS, only show if in standalone mode
  if (isIOS() && !isStandalone()) return false;

  // Already granted or denied
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return false;
  }
  const stored = getStoredNotificationsPermission();
  if (stored === 'denied' || stored === 'granted') return false;

  // Already shown this session
  if (sessionStorage.getItem(STORAGE_KEYS.sessionNotificationShown) === 'true') return false;

  // Dismissed within 7 days
  const dismissedAt = localStorage.getItem(STORAGE_KEYS.dismissedNotificationPromptAt);
  if (dismissedAt && Date.now() - Number(dismissedAt) < SEVEN_DAYS_MS) return false;

  return true;
}

// ---- Standalone detection on app open ----

export function checkAndMarkStandaloneOnOpen(): void {
  if (isStandalone()) {
    markInstalled();
  }
}
