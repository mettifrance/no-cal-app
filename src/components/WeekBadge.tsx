import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';

interface WeekBadgeProps {
  indulgentDays: number;
  totalCheckedDays: number;
}

export default function WeekBadge({ indulgentDays, totalCheckedDays }: WeekBadgeProps) {
  if (totalCheckedDays < 3) return null;

  let emoji: string, title: string, subtitle: string, bgClass: string, borderClass: string;

  if (indulgentDays <= 1) {
    emoji = '🏅'; title = t.badgeBalanced; subtitle = t.badgeBalancedSub;
    bgClass = 'bg-success/10'; borderClass = 'border-success/30';
  } else if (indulgentDays <= 3) {
    emoji = '🙂'; title = t.badgeFlexible; subtitle = t.badgeFlexibleSub;
    bgClass = 'bg-warning/10'; borderClass = 'border-warning/30';
  } else {
    emoji = '⚠️'; title = t.badgeOff; subtitle = t.badgeOffSub;
    bgClass = 'bg-destructive/10'; borderClass = 'border-destructive/30';
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
