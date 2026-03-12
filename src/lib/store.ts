import { Gender, ActivityLevel, Goal, calculateBMR, calculateDailyTarget, calculateWeeklyTarget, getWeekStartDate } from './calories';

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
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
  weekStart: string; // ISO date string
  logs: DayLog[];
}

const PROFILE_KEY = 'nomorecal_profile';
const WEEK_KEY = 'nomorecal_week';

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
}

export function getCurrentWeekData(): WeekData {
  const weekStart = getWeekStartDate().toISOString().split('T')[0];
  const raw = localStorage.getItem(WEEK_KEY);

  if (raw) {
    const data: WeekData = JSON.parse(raw);
    if (data.weekStart === weekStart) return data;
  }

  // New week
  const newWeek: WeekData = { weekStart, logs: [] };
  localStorage.setItem(WEEK_KEY, JSON.stringify(newWeek));
  return newWeek;
}

export function saveDayLog(log: DayLog): WeekData {
  const week = getCurrentWeekData();
  // Replace if exists, add if not
  const existing = week.logs.findIndex(l => l.dayIndex === log.dayIndex);
  if (existing >= 0) {
    week.logs[existing] = log;
  } else {
    week.logs.push(log);
  }
  localStorage.setItem(WEEK_KEY, JSON.stringify(week));
  return week;
}

export function getWeeklyConsumed(week: WeekData): number {
  return week.logs.reduce((sum, log) => sum + log.estimatedConsumption, 0);
}
