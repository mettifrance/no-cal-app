import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, WeekData, fetchWeekLogs, saveDayLogToCloud } from '@/lib/store';
import { getCurrentDayIndex, getDayName } from '@/lib/calories';
import { useAuth } from '@/contexts/AuthContext';
import DayCheckIn from './DayCheckIn';
import MonthlyRhythm from './MonthlyRhythm';
import WeeklyBalanceCard from './WeeklyBalanceCard';
import WeekBadge from './WeekBadge';

interface WeeklyDashboardProps {
  profile: UserProfile;
}

export default function WeeklyDashboard({ profile }: WeeklyDashboardProps) {
  const { user, signOut } = useAuth();
  const [weekData, setWeekData] = useState<WeekData>({ weekStart: '', logs: [] });
  const [checkInDay, setCheckInDay] = useState<number | null>(null);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  const loadWeekData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchWeekLogs(user.id);
      setWeekData(data);
    } catch (err) {
      console.error('Failed to load week data', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  const currentDayIndex = getCurrentDayIndex();
  const checkedDays = new Set(weekData.logs.map(l => l.dayIndex));
  const indulgentDays = weekData.logs.filter(l => !l.onTarget).length;
  const alignedDays = weekData.logs.filter(l => l.onTarget).length;

  const nextUncheckedDay = useMemo(() => {
    for (let i = 0; i <= currentDayIndex; i++) {
      if (!checkedDays.has(i)) return i;
    }
    return null;
  }, [checkedDays, currentDayIndex]);

  async function handleCheckInComplete() {
    await loadWeekData();
    setCheckInDay(null);
  }

  if (view === 'month') {
    return <MonthlyRhythm onBack={() => setView('week')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your week...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-serif">No More Cal</h1>
            <p className="text-sm text-muted-foreground">Weekly awareness</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('month')} className="text-xs text-muted-foreground underline">
              Monthly
            </button>
            <button onClick={signOut} className="text-xs text-muted-foreground underline">
              Sign Out
            </button>
          </div>
        </div>

        <WeeklyBalanceCard alignedDays={alignedDays} indulgentDays={indulgentDays} totalCheckedDays={checkedDays.size} />
        <WeekBadge indulgentDays={indulgentDays} totalCheckedDays={checkedDays.size} />

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h3 className="text-lg font-serif">This Week</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const log = weekData.logs.find(l => l.dayIndex === i);
              const isToday = i === currentDayIndex;
              const isFuture = i > currentDayIndex;
              const dayLabel = getDayName(i).slice(0, 3);
              return (
                <button
                  key={i}
                  disabled={isFuture}
                  onClick={() => !isFuture && setCheckInDay(i)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isToday ? 'ring-2 ring-primary' : ''} ${isFuture ? 'opacity-40' : 'hover:bg-card'}`}
                >
                  <span className="text-xs text-muted-foreground">{dayLabel}</span>
                  <span className="text-lg">{log ? (log.onTarget ? '✅' : '🍰') : (isFuture ? '·' : '○')}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {nextUncheckedDay !== null && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button size="lg" className="w-full rounded-2xl py-6 text-lg" onClick={() => setCheckInDay(nextUncheckedDay)}>
              Check in for {getDayName(nextUncheckedDay)}
            </Button>
          </motion.div>
        )}

        {weekData.logs.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3">
            <h3 className="text-lg font-serif">Log</h3>
            {weekData.logs.sort((a, b) => a.dayIndex - b.dayIndex).map((log) => (
              <div key={log.dayIndex} className="bg-card rounded-xl p-4 border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{log.onTarget ? '✅' : '🍰'}</span>
                    <span className="font-medium">{getDayName(log.dayIndex)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{log.onTarget ? 'Aligned' : 'Indulgent'}</span>
                </div>
                {log.indulgenceDescription && (
                  <p className="text-sm text-muted-foreground mt-1 ml-8">{log.indulgenceDescription}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-5 border border-dashed border-primary/30 text-center space-y-2">
          <div className="text-2xl">✨</div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Pro</strong> will suggest meal ideas that fit your lifestyle.
          </p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {checkInDay !== null && (
          <DayCheckIn
            dayIndex={checkInDay}
            dailyTarget={profile.dailyTarget}
            onComplete={handleCheckInComplete}
            onClose={() => setCheckInDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
