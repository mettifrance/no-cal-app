import { motion } from 'framer-motion';

const REWARD_MESSAGES = [
  "Nice — consistency matters more than perfection.",
  "You're showing up. That's what counts.",
  "Another day logged. Small steps, real progress.",
  "Awareness is a superpower. Keep going.",
  "One check-in closer to understanding your rhythm.",
];

export function getRandomRewardMessage(): string {
  return REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)];
}
