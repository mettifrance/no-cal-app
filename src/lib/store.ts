import { supabase } from '@/integrations/supabase/client';
import { Gender, ActivityLevel, Goal, calculateBMR, calculateDailyTarget, calculateWeeklyTarget, getWeekStartDate, getCurrentDayIndex } from './calories';

export type EatOutFrequency = 'rarely' | '1_2_times' | '3_4_times' | '5_plus';
export type CalorieTrackingAttitude = 'dont_mind' | 'dislike_a_little' | 'really_dislike' | 'hate_it';

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dailyTarget: number;
  weeklyTarget: number;
  eatOutFrequency: EatOutFrequency;
  calorieTrackingAttitude: CalorieTrackingAttitude;
}

export interface DayLog {
  dayIndex: number;
  onTarget: boolean;
  indulgenceDescription?: string;
  estimatedConsumption: number;
}

export interface WeekData {
  weekStart: string;
  logs: DayLog[];
}

export interface DayLogEntry {
  dateKey: string;
  onTarget: boolean;
  indulgenceDescription?: string;
}

// ---- Cloud persistence ----

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    age: data.age,
    gender: data.gender as Gender,
    height: data.height,
    weight: data.weight,
    activityLevel: data.activity_level as ActivityLevel,
    goal: data.goal as Goal,
    dailyTarget: data.daily_target,
    weeklyTarget: data.weekly_target,
    eatOutFrequency: (data as any).eat_out_frequency as EatOutFrequency || 'rarely',
    calorieTrackingAttitude: (data as any).calorie_tracking_attitude as CalorieTrackingAttitude || 'dislike_a_little',
  };
}

export async function saveProfileToCloud(userId: string, input: {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  eatOutFrequency: EatOutFrequency;
  calorieTrackingAttitude: CalorieTrackingAttitude;
}): Promise<UserProfile> {
  const bmr = calculateBMR(input.gender, input.weight, input.height, input.age);
  const dailyTarget = calculateDailyTarget(bmr, input.activityLevel, input.goal);
  const weeklyTarget = calculateWeeklyTarget(dailyTarget);

  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    gender: input.gender,
    age: input.age,
    height: input.height,
    weight: input.weight,
    activity_level: input.activityLevel,
    goal: input.goal,
    daily_target: dailyTarget,
    weekly_target: weeklyTarget,
    eat_out_frequency: input.eatOutFrequency,
    calorie_tracking_attitude: input.calorieTrackingAttitude,
  } as any, { onConflict: 'user_id' });

  if (error) throw error;

  return { ...input, dailyTarget, weeklyTarget };
}

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

export async function saveDayLogToCloud(userId: string, log: DayLog): Promise<void> {
  const dateStr = getDateForDayIndex(log.dayIndex);

  const { error } = await supabase.from('daily_logs').upsert({
    user_id: userId,
    date: dateStr,
    on_target: log.onTarget,
    indulgence_description: log.indulgenceDescription || null,
  }, { onConflict: 'user_id,date' });

  if (error) throw error;
}

export async function fetchWeekLogs(userId: string): Promise<WeekData> {
  const weekStart = getWeekStartDate();
  const weekStartStr = formatLocalDate(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = formatLocalDate(weekEnd);

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', weekStartStr)
    .lte('date', weekEndStr);

  if (error) throw error;

  const logs: DayLog[] = (data || []).map((row) => {
    const [year, month, day] = row.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return {
      dayIndex,
      onTarget: row.on_target,
      indulgenceDescription: row.indulgence_description || undefined,
      estimatedConsumption: 0,
    };
  });

  return { weekStart: weekStartStr, logs };
}

export async function fetchAllLogs(userId: string): Promise<DayLogEntry[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    dateKey: row.date,
    onTarget: row.on_target,
    indulgenceDescription: row.indulgence_description || undefined,
  }));
}

// ---- Weekly Reflections ----

export const WORTH_IT_OPTIONS = [
  { value: 'dinner_out', label: 'Dinner out', emoji: '🍽️' },
  { value: 'dessert', label: 'Dessert', emoji: '🍰' },
  { value: 'drinks', label: 'Drinks', emoji: '🍷' },
  { value: 'social_event', label: 'Social event', emoji: '🎉' },
  { value: 'random_craving', label: 'Random craving', emoji: '🍫' },
  { value: 'none', label: "I didn't have one", emoji: '🌿' },
  { value: 'other', label: 'Other', emoji: '✨' },
] as const;

export async function fetchWeeklyReflection(userId: string, weekStart: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('weekly_reflections' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (error || !data) return null;
  return (data as any).worth_it_indulgence;
}

export async function saveWeeklyReflection(userId: string, weekStart: string, worthItIndulgence: string): Promise<void> {
  const { error } = await supabase.from('weekly_reflections' as any).upsert({
    user_id: userId,
    week_start: weekStart,
    worth_it_indulgence: worthItIndulgence,
  } as any, { onConflict: 'user_id,week_start' });

  if (error) throw error;
}

export function getPreviousWeekStart(): { weekStartStr: string; isComplete: boolean } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - diff);
  thisMonday.setHours(0, 0, 0, 0);

  const prevMonday = new Date(thisMonday);
  prevMonday.setDate(prevMonday.getDate() - 7);

  return {
    weekStartStr: formatLocalDate(prevMonday),
    isComplete: true, // previous week is always complete
  };
}
