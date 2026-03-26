import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import { getDayName } from '@/lib/calories';
import { saveDayLogToCloud } from '@/lib/store';
import { saveLocalDayLog } from '@/lib/localStore';
import { useAuth } from '@/contexts/AuthContext';

interface DayCheckInProps {
  dayIndex: number;
  dailyTarget: number;
  onComplete: (wasAligned: boolean) => void;
  onClose: () => void;
}

type CheckInStep = 'question' | 'sgarro' | 'feedback';

export default function DayCheckIn({ dayIndex, dailyTarget, onComplete, onClose }: DayCheckInProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<CheckInStep>('question');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  function pickFeedback(aligned: boolean) {
    const pool = aligned ? t.feedbackAligned : t.feedbackIndulgent;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function toggleTag(value: string) {
    setSelectedTags(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    );
  }

  async function handleAligned() {
    setSaving(true);
    const log = { dayIndex, onTarget: true, estimatedConsumption: dailyTarget };
    if (user) {
      await saveDayLogToCloud(user.id, log);
    } else {
      saveLocalDayLog(log);
    }
    setSaving(false);
    setFeedbackMsg(pickFeedback(true));
    setStep('feedback');
  }

  async function handleSgarroSubmit() {
    setSaving(true);
    const description = [
      selectedTags.join(', '),
      note.trim(),
    ].filter(Boolean).join(' — ');

    const log = {
      dayIndex,
      onTarget: false,
      indulgenceDescription: description || undefined,
      indulgenceTags: selectedTags,
      estimatedConsumption: dailyTarget,
    };
    if (user) {
      await saveDayLogToCloud(user.id, log);
    } else {
      saveLocalDayLog(log);
    }
    setSaving(false);
    setFeedbackMsg(pickFeedback(false));
    setStep('feedback');
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-background rounded-2xl p-6 w-full max-w-md space-y-5 shadow-xl"
      >
        {step === 'question' && (
          <>
            <div className="text-center">
              <h3 className="text-xl font-serif mb-2">{t.dayNames[dayIndex]}</h3>
              <p className="text-muted-foreground text-lg">{t.checkInQuestion}</p>
            </div>
            <div className="space-y-3">
              <Button size="lg" className="w-full rounded-xl py-5 text-base" onClick={handleAligned} disabled={saving}>
                {saving ? t.saving : `✅ ${t.checkInAligned}`}
              </Button>
              <Button size="lg" variant="outline" className="w-full rounded-xl py-5 text-base" onClick={() => setStep('sgarro')}>
                🍕 {t.checkInIndulgent}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">{t.selectOption}</p>
            <button onClick={onClose} className="w-full text-center text-sm text-muted-foreground">Salta per ora</button>
          </>
        )}

        {step === 'sgarro' && (
          <>
            <div className="text-center">
              <h3 className="text-xl font-serif mb-2">{t.sgarroFollowUp}</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {t.sgarroTags.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    selectedTags.includes(tag.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
            <Textarea
              placeholder={t.sgarroPlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl min-h-[60px] text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground text-center italic">es. "{t.sgarroHint}"</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('question')} className="rounded-xl">{t.back}</Button>
              <Button onClick={handleSgarroSubmit} disabled={saving} className="flex-1 rounded-xl">
                {saving ? t.saving : t.sgarroConfirm}
              </Button>
            </div>
          </>
        )}

        {step === 'feedback' && (
          <>
            <div className="text-center space-y-3">
              <div className="text-4xl">🌿</div>
              <p className="text-lg font-serif">{feedbackMsg}</p>
            </div>
            <Button size="lg" className="w-full rounded-xl" onClick={() => onComplete(!selectedTags.length && step === 'feedback')}>
              Ok
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
