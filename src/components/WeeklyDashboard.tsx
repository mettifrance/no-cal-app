import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, getCurrentWeekData, getWeeklyConsumed, WeekData } from '@/lib/store';
import { getCurrentDayIndex, getDayName, getWeekStatus } from '@/lib/calories';
import DayCheckIn from './DayCheckIn';

interface WeeklyDashboardProps {
  profile: UserProfile;
  onReset: () => void;
}

export default function WeeklyDashboard({ profile, onReset }: WeeklyDashboardProps) {
  const [weekData, setWeekData] = useState<WeekData>(getCurrentWeekData());
  const [checkInDay, setCheckInDay] = useState<number | null>(null);

  const currentDayIndex = getCurrentDayIndex();
  const consumed = getWeeklyConsumed(weekData);
  const remaining = Math.max(0, profile.weeklyTarget - consumed);
  const checkedDays = new Set(weekData.logs.map(l => l.dayIndex));
  const remainingDays = 7 - (currentDayIndex + 1) + (checkedDays.has(currentDayIndex) ? 0 : 0);
  const daysLeftInWeek = Math.max(1, 7 - currentDayIndex - (checkedDays.has(currentDayIndex) ? 1 : 0));
  const avgDailyRemaining = Math.round(remaining / daysLeftInWeek);
  const progress = Math.min(1, consumed / profile.weeklyTarget);
  const status = getWeekStatus(consumed, profile.weeklyTarget, checkedDays.size);

  // Find first unchecked day up to today
  const nextUncheckedDay = useMemo(() => {
    for (let i = 0; i <= currentDayIndex; i++) {
      if (!checkedDays.has(i)) return i;
    }
    return null;
  }, [checkedDays, currentDayIndex]);

  const statusColor = {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-destructive',
  }[status];

  const statusBgColor = {
    green: 'bg-success/15',
    yellow: 'bg-warning/15',
    red: 'bg-destructive/15',
  }[status];

  function handleCheckInComplete() {
    setWeekData(getCurrentWeekData());
    setCheckInDay(null);
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-serif">No More Cal</h1>
            <p className="text-sm text-muted-foreground">Week overview</p>
          </div>
          <button onClick={onReset} className="text-xs text-muted-foreground underline">
            Reset
          </button>
        </div>

        {/* Weekly Progress Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl p-6 border space-y-4"
        >
          <div className="flex justify-between items-end">
            <div>
              <div className="text-sm text-muted-foreground">Weekly Budget</div>
              <div className="text-3xl font-serif">{consumed.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                of {profile.weeklyTarget.toLocaleString()} kcal
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="text-2xl font-serif text-primary">{remaining.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">kcal</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className={`h-4 rounded-full ${statusBgColor} overflow-hidden`}>
            <motion.div
              className={`h-full rounded-full ${statusColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {status === 'green' && '✅ You\'re on track this week!'}
            {status === 'yellow' && '⚠️ You\'re consuming a bit faster than planned.'}
            {status === 'red' && '🔴 You\'re close to your weekly limit.'}
          </div>
        </motion.div>

        {/* Daily Average Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-primary/5 rounded-2xl p-5 border border-primary/20"
        >
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Average daily budget remaining</div>
            <div className="text-3xl font-serif text-primary">{avgDailyRemaining.toLocaleString()} kcal</div>
            <div className="text-sm text-muted-foreground mt-1">
              per day until Sunday ({daysLeftInWeek} {daysLeftInWeek === 1 ? 'day' : 'days'} left)
            </div>
          </div>
        </motion.div>

        {/* Days Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
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
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    isToday ? 'ring-2 ring-primary' : ''
                  } ${isFuture ? 'opacity-40' : 'hover:bg-card'}`}
                >
                  <span className="text-xs text-muted-foreground">{dayLabel}</span>
                  <span className="text-lg">
                    {log ? (log.onTarget ? '✅' : '🍕') : (isFuture ? '·' : '○')}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Check-in prompt */}
        {nextUncheckedDay !== null && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="w-full rounded-2xl py-6 text-lg"
              onClick={() => setCheckInDay(nextUncheckedDay)}
            >
              Check in for {getDayName(nextUncheckedDay)}
            </Button>
          </motion.div>
        )}

        {/* Day logs */}
        {weekData.logs.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-serif">Log</h3>
            {weekData.logs
              .sort((a, b) => a.dayIndex - b.dayIndex)
              .map((log) => (
                <div key={log.dayIndex} className="bg-card rounded-xl p-4 border">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>{log.onTarget ? '✅' : '🍕'}</span>
                      <span className="font-medium">{getDayName(log.dayIndex)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {log.estimatedConsumption.toLocaleString()} kcal
                    </span>
                  </div>
                  {log.indulgenceDescription && (
                    <p className="text-sm text-muted-foreground mt-1 ml-8">
                      {log.indulgenceDescription}
                      {log.extraCalories && (
                        <span className="text-accent"> (+{log.extraCalories.toLocaleString()} kcal)</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
          </motion.div>
        )}
      </div>

      {/* Check-in modal */}
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
