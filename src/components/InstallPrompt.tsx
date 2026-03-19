import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share, Plus } from 'lucide-react';
import { dismissInstallPrompt, markInstallPromptSeen } from '@/lib/promptState';

interface InstallPromptProps {
  onDismiss: () => void;
}

export default function InstallPrompt({ onDismiss }: InstallPromptProps) {
  function handleGotIt() {
    markInstallPromptSeen();
    onDismiss();
  }

  function handleMaybeLater() {
    dismissInstallPrompt();
    onDismiss();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={handleMaybeLater} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md bg-card rounded-t-3xl p-6 pb-10 space-y-5 border-t shadow-xl"
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto" />

        <div className="text-center space-y-2">
          <div className="text-3xl">📱</div>
          <h3 className="text-lg font-serif">Add No More Cal to your Home Screen</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For faster daily check-ins and gentle reminders, save the app to your Home Screen.
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">1</div>
            <p className="text-sm">
              Tap the <Share className="inline h-4 w-4 text-primary -mt-0.5" /> <strong>Share</strong> icon in Safari
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">2</div>
            <p className="text-sm">
              Tap <Plus className="inline h-4 w-4 text-primary -mt-0.5" /> <strong>Add to Home Screen</strong>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">3</div>
            <p className="text-sm">
              Open <strong>No More Cal</strong> from your Home Screen
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleMaybeLater} className="rounded-xl text-muted-foreground">
            Maybe later
          </Button>
          <Button onClick={handleGotIt} className="flex-1 rounded-xl">
            Got it
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
