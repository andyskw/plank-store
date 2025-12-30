export type ExerciseType = 'plank' | 'pushup';
export type PlankVariant = 'regular' | 'forward-bend' | 'one-side';
// Backward compatibility
export type PlankType = PlankVariant;


export type PushupVariant = 'regular' | 'diamond' | 'knee';

export interface ExerciseEntry {
  id: string;
  timestamp: number;
  exerciseType: ExerciseType;
  // For planks: duration in seconds; For pushups: number of reps
  value: number;
  // Variant for either plank or pushup
  variant?: PlankVariant | PushupVariant;
  // For one-side planks
  side?: 'left' | 'right';
}

// Backward compatibility
export type PlankEntry = ExerciseEntry;

export interface Statistics {
  // Plank stats
  todayTotal: number;
  weeklyAverage: number;
  personalBest: number;
  currentStreak: number;
  totalPlanks: number;
  regularTotal: number;
  forwardBendTotal: number;
  oneSideTotal: number;

  // Yesterday's stats
  regularYesterday: number;
  forwardBendYesterday: number;
  oneSideYesterday: number;

  // Pushup stats
  todayPushups: number;
  weeklyPushupAverage: number;
  personalBestPushups: number;
  totalPushups: number;
  totalPushupReps: number;
  regularPushupTotal: number;
  diamondPushupTotal: number;
  kneePushupTotal: number;

  regularPushupYesterday: number;
  diamondPushupYesterday: number;
  kneePushupYesterday: number;
}
