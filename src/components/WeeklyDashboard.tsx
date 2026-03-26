import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, WeekData, fetchWeekLogs, fetchWeeklyReflection, getPreviousWeekStart } from '@/lib/store';
import { fetchLocalWeekLogs, getLocalCheckInCount, shouldShowLoginPrompt } from '@/lib/localStore';
import { getCurrentDayIndex } from '@/lib/calories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getRandomRewardMessage } from './CheckInReward';
import { t } from '@/lib/i18n';
import DayCheckIn from './DayCheckIn';
import MonthlyRhythm from './MonthlyRhythm';
import WeeklyBalanceCard from './WeeklyBalanceCard';
import WeekBadge from './WeekBadge';
import WeeklyStatusMessage from './WeeklyStatusMessage';
import ReturnTrigger from './ReturnTrigger';
import WeeklyReflection from './WeeklyReflection';
import WeeklySummary from './WeeklySummary';
import InstallPrompt from './InstallPrompt';
import NotificationPrompt from './NotificationPrompt';
import EveningBanner from './EveningBanner';
import SoftLoginPrompt from './SoftLoginPrompt';
import {
  shouldShowInstallPrompt,
  shouldShowNotificationPrompt,
  checkAndMarkStandaloneOnOpen,
  isIOS,
  isStandalone,
} from '@/lib/promptState';

interface WeeklyDashboardProps {
  profile: UserProfile;
}

export default function WeeklyDashboard({ profile }: WeeklyDashboardProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [weekData, setWeekData] = useState<WeekData>({ weekStart: '', logs: [] });
  const [checkInDay, setCheckInDay] = useState<number | null>(null);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionWeekStart, setReflectionWeekStart] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showEveningBanner, setShowEveningBanner] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const loadWeekData = useCallback(async () => {
    try {
      if (user) {
        const data = await fetchWeekLogs(user.id);
        setWeekData(data);
      } else {
        const data = fetchLocalWeekLogs();
        setWeekData(data);
      }
    } catch (err) {
      console.error('Failed to load week data', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadWeekData(); }, [loadWeekData]);
  useEffect(() => { checkAndMarkStandaloneOnOpen(); }, []);

  useEffect(() => {
    if (!user) return;
    const { weekStartStr } = getPreviousWeekStart();
    fetchWeeklyReflection(user.id, weekStartStr).then((existing) => {
      if (!existing) {
        setReflectionWeekStart(weekStartStr);
        setShowReflection(true);
      }
    });
  }, [user]);

  const currentDayIndex = getCurrentDayIndex();
  const checkedDays = new Set(weekData.logs.map(l => l.dayIndex));
  const totalCheckIns = weekData.logs.length;
  const indulgentDays = weekData.logs.filter(l => !l.onTarget).length;
  const alignedDays = weekData.logs.filter(l => l.onTarget).length;
  const loggedToday = checkedDays.has(currentDayIndex);

  // Collect all tags from this week's sgarri for weekly summary
  const weekTags = useMemo(() => {
    return weekData.logs
      .filter(l => !l.onTarget && l.indulgenceTags)
      .flatMap(l => l.indulgenceTags || []);
  }, [weekData.logs]);

  useEffect(() => {
    if (loading || !user) return;
    if (isIOS() && !isStandalone()) {
      if (shouldShowInstallPrompt(totalCheckIns)) setShowInstallPrompt(true);
      return;
    }
    if (shouldShowNotificationPrompt(totalCheckIns)) setShowNotificationPrompt(true);
  }, [loading, totalCheckIns, user]);

  useEffect(() => {
    if (loading || user) return;
    const localCount = getLocalCheckInCount();
    if (shouldShowLoginPrompt(localCount)) {
      setShowLoginPrompt(true);
    }
  }, [loading, user, weekData]);

  useEffect(() => {
    if (loading || loggedToday) return;
    const hour = new Date().getHours();
    if (hour >= 18) {
      const notifPerm = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      if (notifPerm !== 'granted') setShowEveningBanner(true);
    }
  }, [loading, loggedToday]);

  const nextUncheckedDay = useMemo(() => {
    for (let i = 0; i <= currentDayIndex; i++) {
      if (!checkedDays.has(i)) return i;
    }
    return null;
  }, [checkedDays, currentDayIndex]);

  async function handleCheckInComplete(wasAligned: boolean) {
    await loadWeekData();
    setCheckInDay(null);
    toast({ description: getRandomRewardMessage(wasAligned) });

    if (!user) {
      const localCount = getLocalCheckInCount();
      if (shouldShowLoginPrompt(localCount)) {
        setTimeout(() => setShowLoginPrompt(true), 1500);
      }
    }
  }

  if (view === 'month') {
    return <MonthlyRhythm onBack={() => setView('week')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-serif">{t.dashboardTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.dashboardSub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('month')} className="text-xs text-muted-foreground underline">{t.monthly}</button>
            {user ? (
              <button onClick={signOut} className="text-xs text-muted-foreground underline">{t.signOut}</button>
            ) : (
              <Button variant="default" size="sm" className="rounded-xl text-xs px-3 py-1 h-auto" onClick={() => setShowLoginPrompt(true)}>{t.saveProgress}</Button>
            )}
          </div>
        </div>

        <WeeklyStatusMessage alignedDays={alignedDays} indulgentDays={indulgentDays} totalCheckedDays={checkedDays.size} />
        <WeeklyBalanceCard alignedDays={alignedDays} indulgentDays={indulgentDays} totalCheckedDays={checkedDays.size} />
        <WeekBadge indulgentDays={indulgentDays} totalCheckedDays={checkedDays.size} />

        {/* Week grid */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h3 className="text-lg font-serif">{t.thisWeek}</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const log = weekData.logs.find(l => l.dayIndex === i);
              const isToday = i === currentDayIndex;
              const isFuture = i > currentDayIndex;
              const dayLabel = t.dayNamesShort[i];
              return (
                <button
                  key={i}
                  disabled={isFuture}
                  onClick={() => !isFuture && setCheckInDay(i)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isToday ? 'ring-2 ring-primary' : ''} ${isFuture ? 'opacity-40' : 'hover:bg-card'}`}
                >
                  <span className="text-xs text-muted-foreground">{dayLabel}</span>
                  <span className="text-lg">{log ? (log.onTarget ? '✅' : '🍕') : (isFuture ? '·' : '○')}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        {nextUncheckedDay !== null && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button size="lg" className="w-full rounded-2xl py-6 text-lg" onClick={() => setCheckInDay(nextUncheckedDay)}>
              {t.checkInFor(t.dayNames[nextUncheckedDay])}
            </Button>
          </motion.div>
        )}

        {loggedToday && nextUncheckedDay === null && <ReturnTrigger />}

        <AnimatePresence>
          {showEveningBanner && !loggedToday && (
            <EveningBanner onDismiss={() => setShowEveningBanner(false)} />
          )}
        </AnimatePresence>

        {/* Log */}
        {weekData.logs.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3">
            <h3 className="text-lg font-serif">Log</h3>
            {weekData.logs.sort((a, b) => a.dayIndex - b.dayIndex).map((log) => (
              <div key={log.dayIndex} className="bg-card rounded-xl p-4 border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{log.onTarget ? '✅' : '🍕'}</span>
                    <span className="font-medium">{t.dayNames[log.dayIndex]}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{log.onTarget ? t.giorniOk.replace('Giorni ok', 'Ok') : 'Sgarro'}</span>
                </div>
                {log.indulgenceDescription && (
                  <p className="text-sm text-muted-foreground mt-1 ml-8">{log.indulgenceDescription}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {showReflection && reflectionWeekStart && (
          <WeeklyReflection
            weekStart={reflectionWeekStart}
            onComplete={() => setShowReflection(false)}
            onSkip={() => setShowReflection(false)}
          />
        )}

        {/* Pro teaser */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-5 border border-dashed border-primary/30 text-center space-y-2">
          <div className="text-2xl">✨</div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Pro</strong> {t.proTeaser}
          </p>
          <p className="text-xs text-muted-foreground">{t.proSoon}</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {checkInDay !== null && (
          <DayCheckIn dayIndex={checkInDay} dailyTarget={profile.dailyTarget} onComplete={handleCheckInComplete} onClose={() => setCheckInDay(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInstallPrompt && <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showNotificationPrompt && <NotificationPrompt onDismiss={() => setShowNotificationPrompt(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showLoginPrompt && !user && (
          <SoftLoginPrompt onDismiss={() => setShowLoginPrompt(false)} checkInCount={getLocalCheckInCount()} />
        )}
      </AnimatePresence>
    </div>
  );
}
