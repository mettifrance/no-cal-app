import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { dismissNotificationPrompt, markNotificationPromptSeen, setNotificationsPermission } from '@/lib/promptState';

interface NotificationPromptProps {
  onDismiss: () => void;
}

export default function NotificationPrompt({ onDismiss }: NotificationPromptProps) {
  const [requesting, setRequesting] = useState(false);

  async function handleEnable() {
    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);
      markNotificationPromptSeen();

      if (permission === 'granted') {
        scheduleReminderCheck();
      }
    } catch {
      // Notification API not available
    } finally {
      setRequesting(false);
      onDismiss();
    }
  }

  function handleNotNow() {
    dismissNotificationPrompt();
    onDismiss();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={handleNotNow} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md bg-card rounded-t-3xl p-6 pb-10 space-y-5 border-t shadow-xl"
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto" />

        <div className="text-center space-y-2">
          <div className="text-3xl">🔔</div>
          <h3 className="text-lg font-serif">Want a gentle reminder to stay consistent?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get a simple evening reminder to log your day in one tap.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleNotNow} className="rounded-xl text-muted-foreground">
            Not now
          </Button>
          <Button onClick={handleEnable} disabled={requesting} className="flex-1 rounded-xl">
            {requesting ? 'Requesting...' : 'Enable reminders'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Register a periodic check for sending reminders via service worker */
function scheduleReminderCheck() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_REMINDER',
      time: '20:00',
    });
  }
}
