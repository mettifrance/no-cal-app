// Rule-based weekly summary with Italian personality

interface WeekSummaryInput {
  giorniOk: number;
  sgarri: number;
  tags: string[]; // all tags used during the week
}

const POSITIVE_MESSAGES = [
  'Settimana solida. La costanza si vede.',
  'Non perfetta, ma reale. Ed è quello che conta.',
  'Stai costruendo qualcosa che dura.',
  'Ritmo costante. Bravo/a.',
  'La disciplina silenziosa è quella che funziona.',
];

const SGARRO_MESSAGES = [
  'Qualche sgarro c\'è stato… ma senza drammi.',
  'La nonna approverebbe quella carbonara.',
  'Settimana umana. E va benissimo così.',
  'Pizza 1 – disciplina 0. Ma la partita è lunga.',
  'Flessibilità fa rima con normalità.',
];

const HEAVY_SGARRO_MESSAGES = [
  'Settimana un po\' libera — ma sei qui, e questo conta.',
  'Tanti sgarri, ma zero sensi di colpa. Si ricomincia.',
  'Ok, non la settimana ideale. Ma domani è un altro giorno.',
];

const STRESS_MESSAGES = [
  'Stress + gelato: combo classico. Ti capisco.',
  'Quando sei stressato/a tendi a sgartare. Normale.',
  'Lo stress è il nemico numero uno. Preparati prima.',
];

const NOIA_MESSAGES = [
  'Piccolo tweak: prova a gestire meglio quei momenti di noia.',
  'La noia è una trappola classica. Trova un\'alternativa.',
  'Noia = frigorifero. Succede a tutti.',
];

const FAME_NERVOSA_MESSAGES = [
  'Fame nervosa? Il corpo parla, ascoltalo.',
  'Quando è il cervello che ha fame, non lo stomaco — fermati un attimo.',
];

const FESTA_MESSAGES = [
  'Festa e amici: impossibile resistere. E non devi.',
  'La vita sociale e il cibo vanno insieme. È normale.',
];

const STANCHEZZA_MESSAGES = [
  'Quando sei stanco/a, tendi a mollare. Normale. Preparati prima.',
  'La stanchezza rende tutto più difficile. Riposa di più.',
];

const CLOSING_LINES = [
  'Domani si riparte.',
  'Continua così.',
  'Sei sulla strada giusta.',
  'Un passo alla volta.',
  'La prossima settimana è tutta tua.',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTagMessage(tags: string[]): string | null {
  const tagCounts: Record<string, number> = {};
  for (const tag of tags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }

  // Find the most frequent tag
  let maxTag = '';
  let maxCount = 0;
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count > maxCount) {
      maxTag = tag;
      maxCount = count;
    }
  }

  if (maxCount < 2) return null; // Only add tag insight if tag appears 2+ times

  switch (maxTag) {
    case 'stress': return pickRandom(STRESS_MESSAGES);
    case 'noia': return pickRandom(NOIA_MESSAGES);
    case 'fame_nervosa': return pickRandom(FAME_NERVOSA_MESSAGES);
    case 'festa': return pickRandom(FESTA_MESSAGES);
    case 'stanchezza': return pickRandom(STANCHEZZA_MESSAGES);
    default: return null;
  }
}

export function generateWeeklySummary(input: WeekSummaryInput): {
  summary: string;
  messages: string[];
  closing: string;
} {
  const { giorniOk, sgarri, tags } = input;
  const total = giorniOk + sgarri;

  // Summary line
  let summary: string;
  if (sgarri === 0) {
    summary = `${giorniOk} giorni ok, 0 sgarri. Settimana perfetta.`;
  } else if (sgarri <= 2) {
    summary = `${giorniOk} giorni ok, ${sgarri} sgarr${sgarri === 1 ? 'o' : 'i'}. Direi equilibrio vero.`;
  } else {
    summary = `${giorniOk} giorni ok, ${sgarri} sgarri. Settimana movimentata.`;
  }

  // Pick 1-2 human messages
  const messages: string[] = [];

  if (sgarri === 0) {
    messages.push(pickRandom(POSITIVE_MESSAGES));
  } else if (sgarri <= 2) {
    messages.push(pickRandom(SGARRO_MESSAGES));
  } else {
    messages.push(pickRandom(HEAVY_SGARRO_MESSAGES));
  }

  // Add tag-based insight if available
  const tagMsg = getTagMessage(tags);
  if (tagMsg) messages.push(tagMsg);

  return {
    summary,
    messages,
    closing: pickRandom(CLOSING_LINES),
  };
}
