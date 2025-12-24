export type ExerciseType = 'plank' | 'pushup';
export type PlankVariant = 'regular' | 'forward-bend';
// Backward compatibility
export type PlankType = PlankVariant;

export interface ExerciseEntry {
  id: string;
  timestamp: number;
  exerciseType: ExerciseType;
  // For planks: duration in seconds; For pushups: number of reps
  value: number;
  // Only used for planks
  variant?: PlankVariant;
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

  // Pushup stats
  todayPushups: number;
  weeklyPushupAverage: number;
  personalBestPushups: number;
  totalPushups: number;
  totalPushupReps: number;
}
