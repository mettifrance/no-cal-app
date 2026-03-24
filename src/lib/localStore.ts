// Local persistence for anonymous users (before account creation)
import { UserProfile, DayLog, WeekData } from './store';
import { getWeekStartDate, getCurrentDayIndex } from './calories';

const KEYS = {
  profile: 'nmc_local_profile',
  logs: 'nmc_local_logs',
  loginPromptDismissedAt: 'nmc_loginPromptDismissedAt',
  loginPromptSessionShown: 'nmc_loginPromptSessionShown',
} as const;

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateForDayIndex(dayIndex: number): string {
  const weekStart = getWeekStartDate();
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  return formatLocalDate(date);
}

// ---- Profile ----

export function getLocalProfile(): UserProfile | null {
  const raw = localStorage.getItem(KEYS.profile);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveLocalProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

// ---- Daily Logs ----

interface StoredLog {
  date: string;
  onTarget: boolean;
  indulgenceDescription?: string;
}

function getAllLocalLogs(): StoredLog[] {
  const raw = localStorage.getItem(KEYS.logs);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveAllLocalLogs(logs: StoredLog[]): void {
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function saveLocalDayLog(log: DayLog): void {
  const dateStr = getDateForDayIndex(log.dayIndex);
  const logs = getAllLocalLogs();
  const existing = logs.findIndex(l => l.date === dateStr);
  const entry: StoredLog = {
    date: dateStr,
    onTarget: log.onTarget,
    indulgenceDescription: log.indulgenceDescription,
  };
  if (existing >= 0) logs[existing] = entry;
  else logs.push(entry);
  saveAllLocalLogs(logs);
}

export function fetchLocalWeekLogs(): WeekData {
  const weekStart = getWeekStartDate();
  const weekStartStr = formatLocalDate(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = formatLocalDate(weekEnd);

  const allLogs = getAllLocalLogs();
  const weekLogs = allLogs.filter(l => l.date >= weekStartStr && l.date <= weekEndStr);

  const logs: DayLog[] = weekLogs.map((row) => {
    const [year, month, day] = row.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return {
      dayIndex,
      onTarget: row.onTarget,
      indulgenceDescription: row.indulgenceDescription,
      estimatedConsumption: 0,
    };
  });

  return { weekStart: weekStartStr, logs };
}

export function getLocalCheckInCount(): number {
  return getAllLocalLogs().length;
}

// ---- Soft login prompt state ----

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldShowLoginPrompt(checkInCount: number): boolean {
  if (checkInCount < 3) return false;
  if (sessionStorage.getItem(KEYS.loginPromptSessionShown) === 'true') return false;
  const dismissedAt = localStorage.getItem(KEYS.loginPromptDismissedAt);
  if (dismissedAt && Date.now() - Number(dismissedAt) < SEVEN_DAYS_MS) return false;
  return true;
}

export function dismissLoginPrompt(): void {
  sessionStorage.setItem(KEYS.loginPromptSessionShown, 'true');
  localStorage.setItem(KEYS.loginPromptDismissedAt, Date.now().toString());
}

export function markLoginPromptSessionShown(): void {
  sessionStorage.setItem(KEYS.loginPromptSessionShown, 'true');
}

// ---- Migration: move local data to cloud ----

export function getLocalDataForMigration(): { profile: UserProfile | null; logs: StoredLog[] } {
  return { profile: getLocalProfile(), logs: getAllLocalLogs() };
}

export function clearLocalData(): void {
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.logs);
}
