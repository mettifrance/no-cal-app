import { Gender, ActivityLevel, Goal, calculateBMR, calculateDailyTarget, calculateWeeklyTarget, getWeekStartDate, getCurrentDayIndex } from './calories';

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dailyTarget: number;
  weeklyTarget: number;
}

export interface DayLog {
  dayIndex: number; // 0-6 (Mon-Sun)
  onTarget: boolean;
  indulgenceDescription?: string;
  extraCalories?: number;
  estimatedConsumption: number;
}

export interface WeekData {
  weekStart: string;
  logs: DayLog[];
}

// Flat log entry with a date key for monthly calendar
export interface DayLogEntry {
  dateKey: string; // YYYY-MM-DD
  onTarget: boolean;
  indulgenceDescription?: string;
}

const PROFILE_KEY = 'nomorecal_profile';
const WEEK_KEY = 'nomorecal_week';
const LOG_HISTORY_KEY = 'nomorecal_log_history';

export function saveProfile(data: {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): UserProfile {
  const bmr = calculateBMR(data.gender, data.weight, data.height, data.age);
  const dailyTarget = calculateDailyTarget(bmr, data.activityLevel, data.goal);
  const weeklyTarget = calculateWeeklyTarget(dailyTarget);

  const profile: UserProfile = {
    ...data,
    dailyTarget,
    weeklyTarget,
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(WEEK_KEY);
  localStorage.removeItem(LOG_HISTORY_KEY);
}

export function getCurrentWeekData(): WeekData {
  const weekStart = getWeekStartDate().toISOString().split('T')[0];
  const raw = localStorage.getItem(WEEK_KEY);

  if (raw) {
    const data: WeekData = JSON.parse(raw);
    if (data.weekStart === weekStart) return data;
  }

  const newWeek: WeekData = { weekStart, logs: [] };
  localStorage.setItem(WEEK_KEY, JSON.stringify(newWeek));
  return newWeek;
}

function getDateForDayIndex(dayIndex: number): string {
  const weekStart = getWeekStartDate();
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString().split('T')[0];
}

export function saveDayLog(log: DayLog): WeekData {
  const week = getCurrentWeekData();
  const existing = week.logs.findIndex(l => l.dayIndex === log.dayIndex);
  if (existing >= 0) {
    week.logs[existing] = log;
  } else {
    week.logs.push(log);
  }
  localStorage.setItem(WEEK_KEY, JSON.stringify(week));

  // Also save to flat log history for monthly view
  const dateKey = getDateForDayIndex(log.dayIndex);
  saveLogEntry({
    dateKey,
    onTarget: log.onTarget,
    indulgenceDescription: log.indulgenceDescription,
  });

  return week;
}

function saveLogEntry(entry: DayLogEntry): void {
  const history = getAllLogs();
  const idx = history.findIndex(e => e.dateKey === entry.dateKey);
  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.push(entry);
  }
  localStorage.setItem(LOG_HISTORY_KEY, JSON.stringify(history));
}

export function getAllLogs(): DayLogEntry[] {
  const raw = localStorage.getItem(LOG_HISTORY_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function getWeeklyConsumed(week: WeekData): number {
  return week.logs.reduce((sum, log) => sum + log.estimatedConsumption, 0);
}
