export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'awareness';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

export function calculateBMR(gender: Gender, weight: number, height: number, age: number): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateDailyTarget(bmr: number, activity: ActivityLevel, goal: Goal): number {
  const maintenance = bmr * ACTIVITY_MULTIPLIERS[activity];
  if (goal === 'lose_weight') {
    return Math.round(maintenance * 0.825); // ~17.5% deficit
  }
  return Math.round(maintenance);
}

export function calculateWeeklyTarget(dailyTarget: number): number {
  return dailyTarget * 7;
}

// Simple calorie estimation dictionary
const FOOD_ESTIMATES: Record<string, number> = {
  pizza: 800,
  'pizza margherita': 800,
  beer: 150,
  wine: 125,
  spritz: 180,
  aperol: 180,
  cocktail: 250,
  chips: 250,
  fries: 350,
  burger: 600,
  tiramisu: 450,
  cake: 400,
  ice cream: 300,
  gelato: 300,
  chocolate: 250,
  dessert: 400,
  pasta: 500,
  carbonara: 600,
  lasagna: 700,
  sushi: 400,
  ramen: 500,
  tacos: 450,
  nachos: 500,
  croissant: 300,
  donut: 350,
  muffin: 400,
  pancakes: 450,
  waffles: 400,
  bread: 200,
  cheese: 200,
  aperitivo: 400,
  brunch: 700,
  buffet: 1200,
  'restaurant dinner': 800,
  'restaurant lunch': 700,
  'family lunch': 900,
  'fast food': 900,
  mcdonalds: 800,
  kebab: 600,
  sandwich: 400,
  wrap: 400,
  salad: 150,
  smoothie: 250,
  juice: 150,
  soda: 140,
  coke: 140,
  latte: 200,
  cappuccino: 120,
  mocha: 300,
  frappuccino: 400,
};

export function estimateExtraCalories(description: string): { total: number; breakdown: { item: string; kcal: number }[] } {
  const lower = description.toLowerCase();
  const breakdown: { item: string; kcal: number }[] = [];
  let total = 0;

  // Check each food keyword
  // Sort by length descending so longer matches take priority
  const sortedKeys = Object.keys(FOOD_ESTIMATES).sort((a, b) => b.length - a.length);
  const matched = new Set<string>();

  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      // Check we haven't matched a substring of this already
      let alreadyMatched = false;
      for (const m of matched) {
        if (m.includes(key)) {
          alreadyMatched = true;
          break;
        }
      }
      if (!alreadyMatched) {
        const kcal = FOOD_ESTIMATES[key];
        breakdown.push({ item: key, kcal });
        total += kcal;
        matched.add(key);
      }
    }
  }

  // If nothing matched, give a default estimate
  if (breakdown.length === 0) {
    breakdown.push({ item: 'indulgent meal', kcal: 500 });
    total = 500;
  }

  return { total, breakdown };
}

export function getWeekStatus(consumed: number, target: number, dayOfWeek: number): 'green' | 'yellow' | 'red' {
  // Expected pace: consumed should be roughly (dayOfWeek / 7) * target
  const expectedPace = (dayOfWeek / 7) * target;
  const ratio = consumed / Math.max(expectedPace, 1);

  if (consumed >= target) return 'red';
  if (ratio > 1.15) return 'yellow';
  if (consumed > target * 0.9) return 'red';
  return 'green';
}

export function getDayName(dayIndex: number): string {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex];
}

// Get current day of week (0 = Monday, 6 = Sunday)
export function getCurrentDayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // Convert from Sunday=0 to Monday=0
}

export function getWeekStartDate(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
