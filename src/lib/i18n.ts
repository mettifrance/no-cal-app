// Lightweight i18n — Italian first, structure for future English support

const it = {
  // Landing
  hero: "Hai sgarrato.\nE allora?",
  heroSub: "Il problema non è lo sgarro. È il senso di colpa dopo.",
  bullets: [
    { emoji: '🍕', text: 'Niente calorie. Solo: oggi com\'è andata davvero?' },
    { emoji: '🤝', text: 'Sgarri? Ok. Raccontali a me, niente giudizi.' },
    { emoji: '😏', text: 'Un po\' pizza, un po\' palestra. È così che funziona.' },
    { emoji: '🧠', text: 'Capisci perché sgari, invece di sentirti in colpa.' },
    { emoji: '🎯', text: 'Migliori il tuo fisico senza diventare ossessivo.' },
  ],
  cta: 'Partiamo',
  ctaSecondary: 'Ho già un account',
  ctaMicro: 'Tranquillo: non ti giudico.',

  // Check-in
  checkInQuestion: "Oggi com'è andata?",
  checkInAligned: 'Ho mangiato bene',
  checkInIndulgent: 'Ho fatto uno sgarro',
  sgarroFollowUp: 'Ci sta. Che è successo?',
  sgarroPlaceholder: 'Vuoi raccontarmela? (facoltativo)',
  sgarroHint: 'Pizza + Netflix + giornata no',
  sgarroConfirm: 'Ok, registrato',

  // Sgarro tags
  sgarroTags: [
    { value: 'stress', label: 'Stress', emoji: '😤' },
    { value: 'noia', label: 'Noia', emoji: '😴' },
    { value: 'fame_nervosa', label: 'Fame nervosa', emoji: '🧠' },
    { value: 'festa', label: 'Festa / amici', emoji: '🎉' },
    { value: 'voglia', label: 'Voglia improvvisa', emoji: '🍫' },
    { value: 'stanchezza', label: 'Stanchezza', emoji: '😩' },
  ],

  // Check-in feedback
  feedbackAligned: [
    'Grande, costanza batte perfezione.',
    'Un passo alla volta.',
    'Continua così, stai andando forte.',
    'Bravo/a. Ogni giorno conta.',
    'La costanza si vede.',
  ],
  feedbackIndulgent: [
    'Ci sta. Domani si riparte.',
    'Zero drammi. Fa parte del gioco.',
    'Uno sgarro non cambia niente. La settimana è lunga.',
    'Succede. L\'importante è tornare in pista.',
    'Registrato. Nessun senso di colpa.',
  ],

  // Dashboard
  dashboardTitle: 'No More Cal',
  dashboardSub: 'Il tuo ritmo settimanale',
  thisWeek: 'Questa settimana',
  monthly: 'Mensile',
  signOut: 'Esci',
  saveProgress: 'Salva i progressi',

  // Weekly balance
  giorniOk: 'Giorni ok',
  sgarri: 'Sgarri',
  daLoggare: 'Da loggare',

  // Status messages
  getStatusMessage: (aligned: number, indulgent: number, total: number): string => {
    if (total === 0) return 'Inizia la settimana con un check-in veloce.';
    if (total === 1 && indulgent === 0) return 'Ottimo inizio. Primo giorno fatto.';
    if (total === 1 && indulgent === 1) return 'Ci sta. La settimana è lunga.';
    if (indulgent === 0) return 'Stai costruendo un ritmo solido.';
    if (indulgent === 1) return '1 sgarro finora — sei ancora in pista.';
    if (indulgent <= 2) return 'Un po\' di flessibilità. La costanza batte la perfezione.';
    if (indulgent <= 3) return 'Più sgarri del previsto — ma ogni check-in conta.';
    return 'Settimana complicata, ma continuare a registrare è già tanto.';
  },

  // Balance status
  balanceGreen: 'Stai andando alla grande questa settimana.',
  balanceYellow: 'Un po\' più di flessibilità del previsto.',
  balanceRed: 'Settimana fuori ritmo, ma domani si ricomincia.',
  balanceEmpty: 'Fai il check-in per iniziare a tracciare il ritmo.',

  // Week badge
  badgeBalanced: 'Settimana equilibrata',
  badgeBalancedSub: 'Hai vissuto e sei rimasto costante.',
  badgeFlexible: 'Settimana flessibile',
  badgeFlexibleSub: 'Un po\' di flessibilità fa parte della vita.',
  badgeOff: 'Settimana fuori ritmo',
  badgeOffSub: 'Più di 2-3 sgarri a settimana rendono l\'obiettivo più difficile.',

  // Day names
  dayNames: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
  dayNamesShort: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],

  // CTA
  checkInFor: (day: string) => `Check-in per ${day}`,

  // Return trigger
  returnTitle: 'Continua il tuo ritmo',
  returnSub: 'Un check-in al giorno, è tutto quello che serve.',

  // Evening banner
  eveningReminder: 'Non dimenticare il check-in di oggi',
  dismiss: 'Chiudi',

  // Soft login
  loginTitle: 'Salva i tuoi progressi',
  loginBody: 'Stai costruendo un bel ritmo — non perdere i dati.',
  loginSkip: 'Continua senza salvare',

  // Pro teaser
  proTeaser: 'Pro ti suggerirà ricette che si adattano al tuo stile di vita.',
  proSoon: 'Coming soon',

  // Monthly
  monthlyTitle: 'Il tuo mese',
  monthlyAligned: 'Giorni ok',
  monthlyIndulgent: 'Sgarri',
  monthlyNoData: 'Nessun dato',
  monthlyInsightWeekend: 'La maggior parte degli sgarri succede nel weekend.',
  monthlyInsightWeekday: 'Sei più costante durante la settimana.',
  monthlyInsightStrong: 'Ottima costanza questo mese — continua così!',

  // Weekly summary
  weeklySummaryTitle: 'La tua settimana',

  // Onboarding
  onboardingWelcome: 'No More Cal',
  onboardingWelcomeSub: 'Il tuo coach settimanale per l\'alimentazione. Resta costante, resta in equilibrio — senza contare ogni pasto.',
  onboardingStart: 'Iniziamo',
  onboardingAboutYou: 'Parlami di te',
  onboardingAboutYouSub: 'Qualche info base per personalizzare l\'esperienza.',
  onboardingBody: 'Il tuo corpo',
  onboardingBodySub: 'Questo ci aiuta a capire il tuo ritmo.',
  onboardingActivity: 'Livello di attività',
  onboardingActivitySub: 'Quanto sei attivo in una settimana tipo?',
  onboardingLifestyle: 'Il tuo stile di vita',
  onboardingLifestyleSub: 'Mangiare fuori fa parte della vita. Quanto spesso succede?',
  onboardingGoal: 'Il tuo obiettivo',
  onboardingGoalSub: 'Cosa vorresti ottenere?',
  onboardingAttitude: 'Un\'ultima cosa',
  onboardingAttitudeSub: 'Sii onesto/a — come ti fa sentire contare le calorie?',
  onboardingDone: 'Tutto pronto',
  onboardingDoneSub: 'Ora capiamo il tuo ritmo e il tuo obiettivo.',
  onboardingDoneDetail: 'L\'app ti aiuterà a restare costante con un semplice check-in giornaliero.',
  onboardingDoneHint: 'Niente conteggio calorie. Niente diario pasti. Solo consapevolezza.',
  onboardingDoneCTA: 'Inizia la mia settimana',
  onboardingNoJudge: 'Nessun giudizio — ci serve per personalizzare l\'esperienza. Niente calorie qui. 🌿',
  back: 'Indietro',
  continue: 'Continua',
  saving: 'Salvataggio...',

  // Select hint
  selectOption: 'Seleziona un\'opzione per continuare',

  // Logged days
  daysLogged: (n: number) => `${n} di 7 giorni registrati`,
  daysLeft: (n: number) => n > 0 ? `${n} giorn${n > 1 ? 'i' : 'o'} da registrare` : 'Tutti i giorni registrati — grande costanza!',
  microCopy: 'Un check-in al giorno → consapevolezza reale nel tempo',
} as const;

// Export current language
export const t = it;
