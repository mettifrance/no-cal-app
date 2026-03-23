import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const WEEK_DOTS = [
  { label: 'Mon', status: 'aligned' },
  { label: 'Tue', status: 'aligned' },
  { label: 'Wed', status: 'indulgent' },
  { label: 'Thu', status: 'aligned' },
  { label: 'Fri', status: 'aligned' },
  { label: 'Sat', status: 'none' },
  { label: 'Sun', status: 'none' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif leading-tight">
            Stop counting calories.
            <br />
            <span className="text-primary">Start understanding your habits.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Finally understand why your diet doesn't stick — with one simple daily check-in.
          </p>
        </div>

        {/* Visual — weekly rhythm preview */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card rounded-2xl p-6 border space-y-3"
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your weekly rhythm</p>
          <div className="flex justify-center gap-4">
            {WEEK_DOTS.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-5 h-5 rounded-full ${
                    d.status === 'aligned'
                      ? 'bg-success'
                      : d.status === 'indulgent'
                      ? 'bg-accent'
                      : 'bg-muted'
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Patterns, not numbers.</p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 text-left"
        >
          {[
            { emoji: '📉', text: 'Lose weight without feeling restricted' },
            { emoji: '💪', text: 'Build habits for a stronger, healthier body' },
            { emoji: '⚡', text: '1 simple check-in per day — no tracking needed' },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-3 bg-card/60 rounded-xl p-3 border border-border/50">
              <span className="text-xl">{b.emoji}</span>
              <span className="text-sm text-foreground">{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="space-y-3 pt-2"
        >
          <Button
            size="lg"
            className="w-full text-lg py-6 rounded-2xl"
            onClick={() => navigate('/onboarding')}
          >
            Start your first check-in
          </Button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground underline"
          >
            I already have an account
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
