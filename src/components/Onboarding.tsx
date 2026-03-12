import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActivityLevel, Gender, Goal } from '@/lib/calories';
import { saveProfile, UserProfile } from '@/lib/store';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const STEPS = ['welcome', 'basics', 'body', 'activity', 'goal', 'result'] as const;
type Step = typeof STEPS[number];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [goal, setGoal] = useState<Goal>('awareness');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const stepIndex = STEPS.indexOf(step);

  function next() {
    if (stepIndex < STEPS.length - 1) {
      if (step === 'goal') {
        // Calculate and show result
        const p = saveProfile({
          age: parseInt(age),
          gender,
          height: parseInt(height),
          weight: parseInt(weight),
          activityLevel,
          goal,
        });
        setProfile(p);
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
        {/* Progress dots */}
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
                <div className="text-6xl mb-4">🥗</div>
                <h1 className="text-4xl font-serif">No More Cal</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Understand your weekly calorie balance without tracking every meal. Simple, supportive, and judgment-free.
                </p>
                <Button size="lg" className="w-full text-lg py-6 rounded-2xl" onClick={next}>
                  Get Started
                </Button>
              </div>
            )}

            {step === 'basics' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">About You</h2>
                  <p className="text-muted-foreground">Just a few basics to personalize your experience.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Gender</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female'] as Gender[]).map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`p-4 rounded-xl border-2 transition-all text-center capitalize ${
                            gender === g
                              ? 'border-primary bg-primary/10 font-semibold'
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          {g === 'male' ? '👨' : '👩'} {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 32"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-1 rounded-xl h-12 text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">Back</Button>
                  <Button onClick={next} disabled={!canProceed()} className="flex-1 rounded-xl">Continue</Button>
                </div>
              </div>
            )}

            {step === 'body' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">Your Body</h2>
                  <p className="text-muted-foreground">This helps us estimate your calorie needs.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="mt-1 rounded-xl h-12 text-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g. 75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="mt-1 rounded-xl h-12 text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={back} className="rounded-xl">Back</Button>
                  <Button onClick={next} disabled={!canProceed()} className="flex-1 rounded-xl">Continue</Button>
                </div>
              </div>
            )}

            {step === 'activity' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">Activity Level</h2>
                  <p className="text-muted-foreground">How active are you on a typical week?</p>
                </div>

                <div className="space-y-3">
                  {([
                    { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise', emoji: '🪑' },
                    { value: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week', emoji: '🚶' },
                    { value: 'moderately_active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week', emoji: '🏃' },
                    { value: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week', emoji: '🏋️' },
                  ] as { value: ActivityLevel; label: string; desc: string; emoji: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setActivityLevel(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        activityLevel === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40'
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
                  <Button variant="outline" onClick={back} className="rounded-xl">Back</Button>
                  <Button onClick={next} className="flex-1 rounded-xl">Continue</Button>
                </div>
              </div>
            )}

            {step === 'goal' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">Your Goal</h2>
                  <p className="text-muted-foreground">What would you like to achieve?</p>
                </div>

                <div className="space-y-3">
                  {([
                    { value: 'lose_weight', label: 'Lose Weight', desc: 'Gentle calorie deficit', emoji: '📉' },
                    { value: 'maintain', label: 'Maintain Weight', desc: 'Stay at your current weight', emoji: '⚖️' },
                    { value: 'awareness', label: 'Improve Awareness', desc: 'Just understand your eating patterns', emoji: '🧠' },
                  ] as { value: Goal; label: string; desc: string; emoji: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGoal(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        goal === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40'
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
                  <Button variant="outline" onClick={back} className="rounded-xl">Back</Button>
                  <Button onClick={next} className="flex-1 rounded-xl">Continue</Button>
                </div>
              </div>
            )}

            {step === 'result' && profile && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">✨</div>
                  <h2 className="text-2xl font-serif mb-2">Your Plan is Ready</h2>
                  <p className="text-muted-foreground">Here's your personalized calorie budget.</p>
                </div>

                <div className="bg-card rounded-2xl p-6 space-y-4 border">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Daily Target</div>
                    <div className="text-4xl font-serif text-primary">{profile.dailyTarget.toLocaleString()}</div>
                    <div className="text-muted-foreground">kcal per day</div>
                  </div>
                  <div className="border-t pt-4 text-center">
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Weekly Budget</div>
                    <div className="text-3xl font-serif">{profile.weeklyTarget.toLocaleString()}</div>
                    <div className="text-muted-foreground">kcal per week</div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                  <p className="text-sm text-center leading-relaxed">
                    💡 Your body responds to <strong>weekly energy balance</strong>, not just daily meals. 
                    An occasional indulgence is fine — what matters is the bigger picture.
                  </p>
                </div>

                <Button size="lg" className="w-full text-lg py-6 rounded-2xl" onClick={() => onComplete(profile)}>
                  Start My Week
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
