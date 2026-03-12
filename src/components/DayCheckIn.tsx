import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDayName, estimateExtraCalories } from '@/lib/calories';
import { saveDayLog } from '@/lib/store';

interface DayCheckInProps {
  dayIndex: number;
  dailyTarget: number;
  onComplete: () => void;
  onClose: () => void;
}

type CheckInStep = 'question' | 'indulgence' | 'result';

export default function DayCheckIn({ dayIndex, dailyTarget, onComplete, onClose }: DayCheckInProps) {
  const [step, setStep] = useState<CheckInStep>('question');
  const [indulgenceText, setIndulgenceText] = useState('');
  const [result, setResult] = useState<{
    extraCalories: number;
    breakdown: { item: string; kcal: number }[];
    total: number;
  } | null>(null);

  function handleOnTarget() {
    saveDayLog({
      dayIndex,
      onTarget: true,
      estimatedConsumption: dailyTarget,
    });
    onComplete();
  }

  function handleIndulgenceSubmit() {
    if (!indulgenceText.trim()) return;
    const estimate = estimateExtraCalories(indulgenceText);
    const total = dailyTarget + estimate.total;

    saveDayLog({
      dayIndex,
      onTarget: false,
      indulgenceDescription: indulgenceText,
      extraCalories: estimate.total,
      estimatedConsumption: total,
    });

    setResult({ extraCalories: estimate.total, breakdown: estimate.breakdown, total });
    setStep('result');
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
              <h3 className="text-xl font-serif mb-2">{getDayName(dayIndex)}</h3>
              <p className="text-muted-foreground">
                Were you roughly within your calorie target today?
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full rounded-xl py-5"
                onClick={handleOnTarget}
              >
                ✅ Yes, I stayed within my target
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl py-5"
                onClick={() => setStep('indulgence')}
              >
                🍕 No, I had an indulgent meal
              </Button>
            </div>

            <button onClick={onClose} className="w-full text-center text-sm text-muted-foreground">
              Skip for now
            </button>
          </>
        )}

        {step === 'indulgence' && (
          <>
            <div className="text-center">
              <h3 className="text-xl font-serif mb-2">What did you have?</h3>
              <p className="text-muted-foreground text-sm">
                No judgment — just describe it briefly so we can estimate.
              </p>
            </div>

            <Input
              placeholder="e.g. pizza and beer, restaurant dinner..."
              value={indulgenceText}
              onChange={(e) => setIndulgenceText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIndulgenceSubmit()}
              className="rounded-xl h-12 text-lg"
              autoFocus
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('question')} className="rounded-xl">
                Back
              </Button>
              <Button
                onClick={handleIndulgenceSubmit}
                disabled={!indulgenceText.trim()}
                className="flex-1 rounded-xl"
              >
                Estimate Calories
              </Button>
            </div>
          </>
        )}

        {step === 'result' && result && (
          <>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-serif mb-2">Got it!</h3>
            </div>

            <div className="bg-card rounded-xl p-4 border space-y-2">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="capitalize">{item.item}</span>
                  <span className="text-muted-foreground">+{item.kcal} kcal</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Extra calories</span>
                <span className="text-accent">+{result.extraCalories.toLocaleString()} kcal</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <p className="text-sm text-center leading-relaxed">
                We estimate this added about <strong>{result.extraCalories.toLocaleString()} kcal</strong> extra. 
                Remember, it's the weekly balance that counts — one indulgent meal doesn't define your week. 💪
              </p>
            </div>

            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={onComplete}
            >
              Done
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
