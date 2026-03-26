import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';

export default function ReturnTrigger() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="bg-primary/5 rounded-2xl p-5 border border-primary/20 text-center space-y-1"
    >
      <p className="text-sm font-medium text-foreground">{t.returnTitle}</p>
      <p className="text-xs text-muted-foreground">{t.returnSub}</p>
    </motion.div>
  );
}
