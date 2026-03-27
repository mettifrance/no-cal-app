import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import pizzaHero from '@/assets/pizza-hero.jpg';

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
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-serif leading-tight whitespace-pre-line">
            {t.hero}
          </h1>
          <p className="text-lg font-medium leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t.heroSub}
          </p>
        </div>

        {/* Pizza hero image */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-2xl overflow-hidden border shadow-lg"
        >
          <img
            src={pizzaHero}
            alt="Pizza margherita appetitosa"
            width={1024}
            height={768}
            className="w-full h-auto object-cover"
          />
        </motion.div>

        {/* Subtitle under image */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm italic text-muted-foreground"
        >
          La vita non ha senso senza pizza.
        </motion.p>

        {/* Benefits */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="space-y-2.5 text-left"
        >
          {t.bullets.map((b) => (
            <div key={b.text} className="flex items-center gap-3 bg-card rounded-xl p-3.5 border shadow-sm">
              <span className="text-xl flex-shrink-0">{b.emoji}</span>
              <span className="text-sm text-foreground leading-snug">{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 pt-2"
        >
          <Button
            size="lg"
            className="w-full text-lg py-6 rounded-2xl shadow-md"
            onClick={() => navigate('/onboarding')}
          >
            {t.cta}
          </Button>
          <p className="text-xs text-muted-foreground italic">{t.ctaMicro}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground underline"
          >
            {t.ctaSecondary}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
