export type BreathingTechniqueId =
  | '478'
  | 'box'
  | 'coherence'
  | 'slow'
  | 'pursed-lip'
  | 'ready-to-learn'
  | 'custom';

export type BreathingPattern = {
  inhale: number;
  holdAfterInhale: number;
  exhale: number;
  holdAfterExhale: number;
};

export type BreathingTechnique = {
  id: BreathingTechniqueId;
  name: string;
  subtitle: string;
  description: string;
  purpose: string;
  pattern: BreathingPattern;
  duration: number;
  cycles: number;
  adjustable?: boolean;
};

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: '478',
    name: '4-7-8 Breathing',
    subtitle: 'A slower evening rhythm',
    description: 'A structured breathing pattern with a longer exhale and gentle pauses.',
    purpose: 'Evening relaxation',
    pattern: {
      inhale: 4,
      holdAfterInhale: 7,
      exhale: 8,
      holdAfterExhale: 0,
    },
    duration: 95,
    cycles: 5,
  },
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: 'Four equal breathing phases',
    description: 'Follow four evenly timed phases to create a predictable rhythm.',
    purpose: 'Focus and preparation',
    pattern: {
      inhale: 4,
      holdAfterInhale: 4,
      exhale: 4,
      holdAfterExhale: 4,
    },
    duration: 80,
    cycles: 5,
  },
  {
    id: 'coherence',
    name: 'Cardiac Coherence',
    subtitle: 'A smooth, balanced rhythm',
    description: 'Practice slow, evenly paced breathing with equal inhalation and exhalation.',
    purpose: 'Rhythmic breathing practice',
    pattern: {
      inhale: 5.5,
      holdAfterInhale: 0,
      exhale: 5.5,
      holdAfterExhale: 0,
    },
    duration: 55,
    cycles: 5,
  },
  {
    id: 'slow',
    name: 'Slow-Paced Breathing',
    subtitle: 'Slow down with a longer exhale',
    description: 'Breathe in gently for four seconds and breathe out slowly for six seconds.',
    purpose: 'Everyday relaxation and unwinding',
    pattern: {
      inhale: 4,
      holdAfterInhale: 0,
      exhale: 6,
      holdAfterExhale: 0,
    },
    duration: 50,
    cycles: 5,
  },
  {
    id: 'pursed-lip',
    name: 'Pursed-Lip Breathing',
    subtitle: 'A slow, controlled exhale',
    description: 'Breathe in gently, then breathe out slowly through softly pursed lips.',
    purpose: 'Gentle breathing practice',
    pattern: {
      inhale: 2,
      holdAfterInhale: 0,
      exhale: 4,
      holdAfterExhale: 0,
    },
    duration: 30,
    cycles: 5,
    adjustable: true,
  },
  {
    id: 'ready-to-learn',
    name: 'Ready to Learn',
    subtitle: 'Prepare for focused activity',
    description: 'Use a slightly longer, comfortable inhale followed by a shorter exhale.',
    purpose: 'Before studying or focused work',
    pattern: {
      inhale: 6,
      holdAfterInhale: 0,
      exhale: 4,
      holdAfterExhale: 0,
    },
    duration: 50,
    cycles: 5,
  },
  {
    id: 'custom',
    name: 'Your Own Rhythm',
    subtitle: 'Build a breathing pattern that suits you',
    description: 'Create and save your own breathing routine.',
    purpose: 'Personalised practice',
    pattern: {
      inhale: 4,
      holdAfterInhale: 0,
      exhale: 6,
      holdAfterExhale: 0,
    },
    duration: 50,
    cycles: 5,
    adjustable: true,
  },
];