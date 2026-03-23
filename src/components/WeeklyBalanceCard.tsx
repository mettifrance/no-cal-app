import { motion } from 'framer-motion';

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

const STATUS_CONFIG: Record<BalanceStatus, { color: string; bg: string; message: string }> = {
  green: {
    color: 'bg-success',
    bg: 'bg-success/15',
    message: "You're in a great rhythm this week.",
  },
  yellow: {
    color: 'bg-warning',
    bg: 'bg-warning/15',
    message: 'A bit more flexibility than planned.',
  },
  red: {
    color: 'bg-destructive',
    bg: 'bg-destructive/15',
    message: 'This week is drifting away from your goal.',
  },
};

export default function WeeklyBalanceCard({ alignedDays, indulgentDays, totalCheckedDays }: WeeklyBalanceCardProps) {
  const status = getStatus(indulgentDays);
  const config = STATUS_CONFIG[status];
  const progress = totalCheckedDays > 0 ? alignedDays / totalCheckedDays : 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card rounded-2xl p-6 border space-y-4"
    >
      <div className="text-center">
        <h2 className="text-lg font-serif mb-1">Weekly Balance</h2>
      </div>

      <div className="flex justify-around text-center">
        <div>
          <div className="text-3xl font-serif text-success">{alignedDays}</div>
          <div className="text-xs text-muted-foreground">Aligned</div>
        </div>
        <div className="w-px bg-border" />
        <div>
          <div className="text-3xl font-serif text-accent">{indulgentDays}</div>
          <div className="text-xs text-muted-foreground">Indulgent</div>
        </div>
        <div className="w-px bg-border" />
        <div>
          <div className="text-3xl font-serif text-muted-foreground">{7 - totalCheckedDays}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>

      {/* Balance bar */}
      <div className={`h-3 rounded-full ${config.bg} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${config.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <p className="text-sm text-center text-muted-foreground">
        {totalCheckedDays === 0
          ? 'Check in to start tracking your rhythm.'
          : config.message}
      </p>

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">
          {totalCheckedDays} of 7 days logged this week
        </p>
        <p className="text-xs text-muted-foreground">
          Small daily check-ins → real awareness over time
        </p>
      </div>
    </motion.div>
  );
}
