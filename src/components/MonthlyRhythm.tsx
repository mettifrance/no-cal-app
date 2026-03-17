import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getAllLogs } from '@/lib/store';

interface MonthlyRhythmProps {
  onBack: () => void;
}

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function MonthlyRhythm({ onBack }: MonthlyRhythmProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const logs = useMemo(() => getAllLogs(), []);

  const totalDays = getMonthDays(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Build a map of date string -> status
  const dayStatusMap = useMemo(() => {
    const map: Record<string, 'aligned' | 'indulgent'> = {};
    for (const entry of logs) {
      if (entry.onTarget) {
        map[entry.dateKey] = 'aligned';
      } else {
        map[entry.dateKey] = 'indulgent';
      }
    }
    return map;
  }, [logs]);

  function getDateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-serif">Monthly Rhythm</h1>
            <p className="text-sm text-muted-foreground">{monthName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl">
            ← Back
          </Button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl p-5 border"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
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
                <div
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg ${
                    isToday ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={`w-2 h-2 rounded-full mt-0.5 ${dotColor}`} />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            Aligned
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            Indulgent
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted" />
            No data
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Scan for patterns. The goal is awareness, not perfection.
          </p>
        </div>
      </div>
    </div>
  );
}
