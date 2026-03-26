import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';

interface EveningBannerProps {
  onDismiss: () => void;
}

export default function EveningBanner({ onDismiss }: EveningBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🌙</span>
        <p className="text-sm font-medium">{t.eveningReminder}</p>
      </div>
      <button onClick={onDismiss} className="text-xs text-muted-foreground underline">
        {t.dismiss}
      </button>
    </motion.div>
  );
}
