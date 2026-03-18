import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WORTH_IT_OPTIONS, saveWeeklyReflection } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WeeklyReflectionProps {
  weekStart: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function WeeklyReflection({ weekStart, onComplete, onSkip }: WeeklyReflectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user || !selected) return;
    setSaving(true);
    try {
      await saveWeeklyReflection(user.id, weekStart, selected);
      onComplete();
    } catch (err: any) {
      toast({ title: 'Could not save', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="text-3xl">🪞</div>
        <h3 className="text-lg font-serif">Weekly Reflection</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A little flexibility is part of real life. Which indulgence felt truly worth it this week?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {WORTH_IT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
              selected === opt.value
                ? 'border-primary bg-primary/10 font-medium'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="mr-2">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onSkip} className="rounded-xl text-muted-foreground">
          Skip
        </Button>
        <Button
          onClick={handleSave}
          disabled={!selected || saving}
          className="flex-1 rounded-xl"
        >
          {saving ? 'Saving...' : 'Save Reflection'}
        </Button>
      </div>
    </motion.div>
  );
}
