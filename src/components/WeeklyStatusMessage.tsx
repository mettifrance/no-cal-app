import { motion } from 'framer-motion';

interface WeeklyStatusMessageProps {
  alignedDays: number;
  indulgentDays: number;
  totalCheckedDays: number;
}

function getMessage(aligned: number, indulgent: number, total: number): string {
  if (total === 0) return "Start your week with a quick check-in.";
  if (total === 1 && indulgent === 0) return "Great start — one day down.";
  if (total === 1 && indulgent === 1) return "Flexibility is part of the journey. Keep going.";
  if (indulgent === 0) return "You're building a solid rhythm this week.";
  if (indulgent === 1) return `1 indulgence so far — you're still on track.`;
  if (indulgent <= 2) return "A little flexibility this week. Consistency beats perfection.";
  if (indulgent <= 3) return "More flexibility than planned — but every check-in builds awareness.";
  return "This week is drifting, but showing up matters. Keep going.";
}

export default function WeeklyStatusMessage({ alignedDays, indulgentDays, totalCheckedDays }: WeeklyStatusMessageProps) {
  const message = getMessage(alignedDays, indulgentDays, totalCheckedDays);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center"
    >
      <p className="text-base text-foreground font-medium leading-relaxed">{message}</p>
    </motion.div>
  );
}
