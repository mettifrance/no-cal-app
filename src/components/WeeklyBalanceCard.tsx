import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';

interface WeeklyBalanceCardProps {
  alignedDays: number;
  indulgentDays: number;
  totalCheckedDays: number;
}

type BalanceStatus = 'green' | 'yellow' | 'red';

function getStatus(indulgentDays: number): BalanceStatus {
  if (indulgentDays <= 1) return 'green';
  if (indulgentDays <= 3) return 'yellow';
  return 'red';
}

export default function WeeklyBalanceCard({ alignedDays, indulgentDays, totalCheckedDays }: WeeklyBalanceCardProps) {
  const status = getStatus(indulgentDays);
  const progress = totalCheckedDays > 0 ? alignedDays / totalCheckedDays : 0;

  const statusMsg = totalCheckedDays === 0
    ? t.balanceEmpty
    : status === 'green' ? t.balanceGreen
    : status === 'yellow' ? t.balanceYellow
    : t.balanceRed;

  const statusConfig = {
    green: { color: 'bg-success', bg: 'bg-success/15' },
    yellow: { color: 'bg-warning', bg: 'bg-warning/15' },
    red: { color: 'bg-destructive', bg: 'bg-destructive/15' },
  };
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card rounded-2xl p-6 border space-y-4"
    >
      <div className="flex justify-around text-center">
        <div>
          <div className="text-3xl font-serif text-success">{alignedDays}</div>
          <div className="text-xs text-muted-foreground">{t.giorniOk}</div>
        </div>
        <div className="w-px bg-border" />
        <div>
          <div className="text-3xl font-serif text-accent">{indulgentDays}</div>
          <div className="text-xs text-muted-foreground">{t.sgarri}</div>
        </div>
        <div className="w-px bg-border" />
        <div>
          <div className="text-3xl font-serif text-muted-foreground">{7 - totalCheckedDays}</div>
          <div className="text-xs text-muted-foreground">{t.daLoggare}</div>
        </div>
      </div>

      <div className={`h-3 rounded-full ${config.bg} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${config.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <p className="text-sm text-center text-muted-foreground">{statusMsg}</p>

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">{t.daysLogged(totalCheckedDays)}</p>
        <p className="text-xs text-muted-foreground">{t.daysLeft(7 - totalCheckedDays)}</p>
        <p className="text-xs text-muted-foreground mt-1">{t.microCopy}</p>
      </div>
    </motion.div>
  );
}
