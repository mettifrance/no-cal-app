import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { generateWeeklySummary } from '@/lib/weeklySummary';
import { t } from '@/lib/i18n';

interface WeeklySummaryProps {
  giorniOk: number;
  sgarri: number;
  tags: string[];
  onDismiss: () => void;
}

export default function WeeklySummary({ giorniOk, sgarri, tags, onDismiss }: WeeklySummaryProps) {
  const summary = useMemo(() => generateWeeklySummary({ giorniOk, sgarri, tags }), [giorniOk, sgarri, tags]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-background rounded-2xl p-6 w-full max-w-md space-y-5 shadow-xl"
      >
        <div className="text-center space-y-1">
          <div className="text-3xl">📊</div>
          <h3 className="text-xl font-serif">{t.weeklySummaryTitle}</h3>
        </div>

        <p className="text-base text-center font-medium text-foreground">{summary.summary}</p>

        <div className="space-y-2">
          {summary.messages.map((msg, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border">
              <p className="text-sm text-foreground leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-primary font-medium">{summary.closing}</p>

        <Button size="lg" className="w-full rounded-xl" onClick={onDismiss}>
          Ok
        </Button>
      </motion.div>
    </motion.div>
  );
}
