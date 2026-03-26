import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';

interface WeeklyStatusMessageProps {
  alignedDays: number;
  indulgentDays: number;
  totalCheckedDays: number;
}

export default function WeeklyStatusMessage({ alignedDays, indulgentDays, totalCheckedDays }: WeeklyStatusMessageProps) {
  const message = t.getStatusMessage(alignedDays, indulgentDays, totalCheckedDays);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center"
    >
      <p className="text-base text-foreground font-medium leading-relaxed">{message}</p>
    </motion.div>
  );
}
