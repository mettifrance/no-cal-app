import { motion } from 'framer-motion';

interface WeekBadgeProps {
  indulgentDays: number;
  totalCheckedDays: number;
}

export default function WeekBadge({ indulgentDays, totalCheckedDays }: WeekBadgeProps) {
  if (totalCheckedDays < 3) return null;

  let emoji: string;
  let title: string;
  let subtitle: string;
  let bgClass: string;
  let borderClass: string;

  if (indulgentDays <= 1) {
    emoji = '🏅';
    title = 'Balanced Week';
    subtitle = 'You enjoyed life and stayed consistent.';
    bgClass = 'bg-success/10';
    borderClass = 'border-success/30';
  } else if (indulgentDays <= 3) {
    emoji = '🙂';
    title = 'Flexible Week';
    subtitle = 'A little flexibility is part of real life.';
    bgClass = 'bg-warning/10';
    borderClass = 'border-warning/30';
  } else {
    emoji = '⚠️';
    title = 'Off Rhythm Week';
    subtitle = "More than 2–3 indulgences per week usually makes the goal harder.";
    bgClass = 'bg-destructive/10';
    borderClass = 'border-destructive/30';
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={`rounded-2xl p-4 border ${bgClass} ${borderClass} text-center space-y-1`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="font-serif text-base">{title}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
