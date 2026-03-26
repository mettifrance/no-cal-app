import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fetchAllLogs, DayLogEntry } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';

interface MonthlyRhythmProps {
  onBack: () => void;
}

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function deriveInsights(logs: DayLogEntry[], year: number, month: number): string[] {
  const monthLogs = logs.filter((l) => {
    const [y, m] = l.dateKey.split('-').map(Number);
    return y === year && m === month + 1;
  });
  if (monthLogs.length < 5) return [];

  const insights: string[] = [];
  let weekdayIndulgent = 0, weekendIndulgent = 0, weekdayTotal = 0, weekendTotal = 0;

  for (const log of monthLogs) {
    const [y, m, d] = log.dateKey.split('-').map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    if (isWeekend) { weekendTotal++; if (!log.onTarget) weekendIndulgent++; }
    else { weekdayTotal++; if (!log.onTarget) weekdayIndulgent++; }
  }

  if (weekendTotal >= 2 && weekendIndulgent / weekendTotal > 0.5 && weekendIndulgent > weekdayIndulgent) {
    insights.push(t.monthlyInsightWeekend);
  }
  if (weekdayTotal >= 3 && weekdayIndulgent / weekdayTotal < 0.2) {
    insights.push(t.monthlyInsightWeekday);
  }

  const alignedCount = monthLogs.filter((l) => l.onTarget).length;
  if (alignedCount / monthLogs.length >= 0.7) {
    insights.push(t.monthlyInsightStrong);
  }

  return insights.slice(0, 2);
}

export default function MonthlyRhythm({ onBack }: MonthlyRhythmProps) {
  const { user } = useAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  const [logs, setLogs] = useState<DayLogEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchAllLogs(user.id).then(setLogs);
  }, [user]);

  const totalDays = getMonthDays(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const dayStatusMap = useMemo(() => {
    const map: Record<string, 'aligned' | 'indulgent'> = {};
    for (const entry of logs) {
      map[entry.dateKey] = entry.onTarget ? 'aligned' : 'indulgent';
    }
    return map;
  }, [logs]);

  const insights = useMemo(() => deriveInsights(logs, year, month), [logs, year, month]);

  function getDateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-serif">{t.monthlyTitle}</h1>
            <p className="text-sm text-muted-foreground capitalize">{monthName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl">← {t.back}</Button>
        </div>

        {(() => {
          const monthLogs = logs.filter((l) => {
            const [y, m] = l.dateKey.split('-').map(Number);
            return y === year && m === month + 1;
          });
          const alignedCount = monthLogs.filter(l => l.onTarget).length;
          if (monthLogs.length === 0) return null;
          return (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
              <p className="text-base text-foreground font-medium">
                {alignedCount} di {monthLogs.length} giorni ok — {alignedCount / monthLogs.length >= 0.7 ? 'grande costanza' : 'continua a costruire il tuo ritmo'}
              </p>
            </motion.div>
          );
        })()}

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card rounded-2xl p-5 border">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {t.dayNamesShort.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: totalDays }, (_, i) => {
              const day = i + 1;
              const dateKey = getDateKey(day);
              const status = dayStatusMap[dateKey];
              const isToday = day === now.getDate();
              let dotColor = 'bg-muted';
              if (status === 'aligned') dotColor = 'bg-success';
              else if (status === 'indulgent') dotColor = 'bg-accent';
              return (
                <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-lg ${isToday ? 'ring-2 ring-primary' : ''}`}>
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={`w-2 h-2 rounded-full mt-0.5 ${dotColor}`} />
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-success" />{t.monthlyAligned}</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-accent" />{t.monthlyIndulgent}</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-muted" />{t.monthlyNoData}</div>
        </div>

        {insights.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-primary/5 rounded-2xl p-5 border border-primary/20 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Insights</p>
            {insights.map((ins, i) => (
              <p key={i} className="text-sm text-foreground">💡 {ins}</p>
            ))}
          </motion.div>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Cerca i pattern. L'obiettivo è la consapevolezza, non la perfezione.</p>
        </div>
      </div>
    </div>
  );
}
