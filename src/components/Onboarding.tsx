import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActivityLevel, Gender, Goal, calculateBMR, calculateDailyTarget, calculateWeeklyTarget } from '@/lib/calories';
import { saveProfileToCloud, UserProfile, EatOutFrequency, CalorieTrackingAttitude } from '@/lib/store';
import { saveLocalProfile } from '@/lib/localStore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const STEPS = ['welcome', 'basics', 'body', 'activity', 'eat_out', 'goal', 'calorie_attitude', 'result'] as const;
type Step = typeof STEPS[number];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('welcome');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [goal, setGoal] = useState<Goal>('awareness');
  const [eatOutFrequency, setEatOutFrequency] = useState<EatOutFrequency>('1_2_times');
  const [calorieTrackingAttitude, setCalorieTrackingAttitude] = useState<CalorieTrackingAttitude>('dislike_a_little');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  async function next() {
    if (stepIndex < STEPS.length - 1) {
      if (step === 'calorie_attitude') {
        setSaving(true);
        try {
          const input = {
            age: parseInt(age),
            gender,
            height: parseInt(height),
            weight: parseInt(weight),
            activityLevel,
            goal,
            eatOutFrequency,
            calorieTrackingAttitude,
          };

          if (user) {
            const p = await saveProfileToCloud(user.id, input);
            setProfile(p);
          } else {
            const bmr = calculateBMR(gender, parseInt(weight), parseInt(height), parseInt(age));
            const dailyTarget = calculateDailyTarget(bmr, activityLevel, goal);
            const weeklyTarget = calculateWeeklyTarget(dailyTarget);
            const p: UserProfile = { ...input, dailyTarget, weeklyTarget };
            saveLocalProfile(p);
            setProfile(p);
          }
        } catch (err: any) {
          toast({ title: 'Errore', description: err.message, variant: 'destructive' });
          setSaving(false);
          return;
        }
        setSaving(false);
      }
      setStep(STEPS[stepIndex + 1]);
    }
  }

  function back() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  }

  const canProceed = () => {
    switch (step) {
      case 'basics': return age && parseInt(age) > 0;
      case 'body': return height && weight && parseInt(height) > 0 && parseInt(weight) > 0;
      default: return true;
    }
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step !== 'welcome' && (
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.slice(1).map((s, i) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= stepIndex - 1 ? 'w-8 bg-primary' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 'welcome' && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🌿</div>
                <h1 className="text-4xl font-serif">{t.onboardingWelcome}</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">{t.onboardingWelcomeSub}</p>
                <Button size="lg" className="w-full text-lg py-6 rounded-2xl" onClick={next}>
                  {t.onboardingStart}
                </Button>
              </div>
            )}

            {step === 'basics' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingAboutYou}</h2>
                  <p className="text-muted-foreground">{t.onboardingAboutYouSub}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Genere</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female'] as Gender[]).map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            gender === g ? 'border-primary bg-primary/10 font-semibold' : 'border-border hover:border-primary/40'
                          }`}
                        >
                          {g === 'male' ? '👨 Uomo' : '👩 Donna'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="age">Età</Label>
                    <Input id="age" type="number" placeholder="es. 32" value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 rounded-xl h-12 text-lg" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">{t.back}</Button>
                  <Button onClick={next} disabled={!canProceed()} className="flex-1 rounded-xl">{t.continue}</Button>
                </div>
              </div>
            )}

            {step === 'body' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingBody}</h2>
                  <p className="text-muted-foreground">{t.onboardingBodySub}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Altezza (cm)</Label>
                    <Input id="height" type="number" placeholder="es. 175" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 rounded-xl h-12 text-lg" />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input id="weight" type="number" placeholder="es. 75" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 rounded-xl h-12 text-lg" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">{t.back}</Button>
                  <Button onClick={next} disabled={!canProceed()} className="flex-1 rounded-xl">{t.continue}</Button>
                </div>
              </div>
            )}

            {step === 'activity' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingActivity}</h2>
                  <p className="text-muted-foreground">{t.onboardingActivitySub}</p>
                </div>
                <div className="space-y-3">
                  {([
                    { value: 'sedentary', label: 'Sedentario', desc: 'Lavoro d\'ufficio, poco esercizio', emoji: '🪑' },
                    { value: 'lightly_active', label: 'Leggermente attivo', desc: 'Esercizio leggero 1-3 giorni/settimana', emoji: '🚶' },
                    { value: 'moderately_active', label: 'Moderatamente attivo', desc: 'Esercizio moderato 3-5 giorni/settimana', emoji: '🏃' },
                    { value: 'very_active', label: 'Molto attivo', desc: 'Esercizio intenso 6-7 giorni/settimana', emoji: '🏋️' },
                  ] as { value: ActivityLevel; label: string; desc: string; emoji: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setActivityLevel(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        activityLevel === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-sm text-muted-foreground">{opt.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">{t.back}</Button>
                  <Button onClick={next} className="flex-1 rounded-xl">{t.continue}</Button>
                </div>
              </div>
            )}

            {step === 'eat_out' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingLifestyle}</h2>
                  <p className="text-muted-foreground">{t.onboardingLifestyleSub}</p>
                </div>
                <div className="space-y-3">
                  {([
                    { value: 'rarely', label: 'Raramente', desc: 'Cucino quasi sempre a casa', emoji: '🏡' },
                    { value: '1_2_times', label: '1–2 volte a settimana', desc: 'Un pasto o due fuori', emoji: '🍽️' },
                    { value: '3_4_times', label: '3–4 volte a settimana', desc: 'Mangio fuori spesso', emoji: '🥡' },
                    { value: '5_plus', label: '5+ volte a settimana', desc: 'La maggior parte dei pasti sono fuori', emoji: '📱' },
                  ] as { value: EatOutFrequency; label: string; desc: string; emoji: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEatOutFrequency(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        eatOutFrequency === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-sm text-muted-foreground">{opt.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">{t.back}</Button>
                  <Button onClick={next} className="flex-1 rounded-xl">{t.continue}</Button>
                </div>
              </div>
            )}

            {step === 'goal' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingGoal}</h2>
                  <p className="text-muted-foreground">{t.onboardingGoalSub}</p>
                </div>
                <div className="space-y-3">
                  {([
                    { value: 'lose_weight', label: 'Perdere peso', desc: 'Costruire un deficit sostenibile', emoji: '📉' },
                    { value: 'maintain', label: 'Mantenere il peso', desc: 'Restare in equilibrio e costante', emoji: '⚖️' },
                    { value: 'awareness', label: 'Migliorare la consapevolezza', desc: 'Capire i tuoi pattern alimentari', emoji: '🧠' },
                  ] as { value: Goal; label: string; desc: string; emoji: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGoal(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        goal === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-sm text-muted-foreground">{opt.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">{t.back}</Button>
                  <Button onClick={next} className="flex-1 rounded-xl">{t.continue}</Button>
                </div>
              </div>
            )}

            {step === 'calorie_attitude' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingAttitude}</h2>
                  <p className="text-muted-foreground">{t.onboardingAttitudeSub}</p>
                </div>
                <div className="space-y-3">
                  {([
                    { value: 'dont_mind', label: 'Non mi dà fastidio', desc: 'Okay, solo un po\' noioso', emoji: '😐' },
                    { value: 'dislike_a_little', label: 'Non mi piace tanto', desc: 'Preferirei evitarlo, ma capisco il senso', emoji: '😕' },
                    { value: 'really_dislike', label: 'Lo detesto', desc: 'Mangiare non dovrebbe essere matematica', emoji: '😩' },
                    { value: 'hate_it', label: 'Lo odio', desc: 'Ecco perché sono qui', emoji: '🙅' },
                  ] as { value: CalorieTrackingAttitude; label: string; desc: string; emoji: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCalorieTrackingAttitude(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        calorieTrackingAttitude === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-sm text-muted-foreground">{opt.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.onboardingNoJudge}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">{t.back}</Button>
                  <Button onClick={next} disabled={saving} className="flex-1 rounded-xl">{saving ? t.saving : t.continue}</Button>
                </div>
              </div>
            )}

            {step === 'result' && profile && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">✨</div>
                  <h2 className="text-2xl font-serif mb-2">{t.onboardingDone}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t.onboardingDoneSub}</p>
                </div>
                <div className="bg-card rounded-2xl p-6 space-y-4 border">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">🌿</div>
                    <p className="text-foreground leading-relaxed">{t.onboardingDoneDetail}</p>
                    <p className="text-sm text-muted-foreground">{t.onboardingDoneHint}</p>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                  <p className="text-sm text-center leading-relaxed">
                    💡 Piccole abitudini costanti creano risultati duraturi. Ti aiutiamo a vedere il quadro generale — settimana dopo settimana.
                  </p>
                </div>
                <Button size="lg" className="w-full text-lg py-6 rounded-2xl" onClick={() => onComplete(profile)}>
                  {t.onboardingDoneCTA}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
