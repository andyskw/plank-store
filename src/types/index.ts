export type PlankType = 'regular' | 'forward-bend';

export interface PlankEntry {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  type: PlankType;
}

export interface Statistics {
  todayTotal: number;
  weeklyAverage: number;
  personalBest: number;
  currentStreak: number;
  totalPlanks: number;
  regularTotal: number;
  forwardBendTotal: number;
}
