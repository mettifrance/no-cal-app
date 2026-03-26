import { t } from '@/lib/i18n';

export function getRandomRewardMessage(wasAligned: boolean = true): string {
  const pool = wasAligned ? t.feedbackAligned : t.feedbackIndulgent;
  return pool[Math.floor(Math.random() * pool.length)];
}
