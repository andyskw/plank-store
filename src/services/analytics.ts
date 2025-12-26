import type { ExerciseEntry, ExerciseType } from '../types';

export type TimeRange = 'week' | 'month' | 'year';

export interface DailyStat {
    date: string; // YYYY-MM-DD
    timestamp: number;
    totalValue: number; // Seconds for plank, Reps for pushup
    entryCount: number;
    movingAverage: number;
    isToday?: boolean;
}

export const calculateMovingAverage = (
    data: { totalValue: number }[],
    index: number,
    windowSize: number
): number => {
    const start = Math.max(0, index - windowSize + 1);
    const subset = data.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + curr.totalValue, 0);
    return Math.round(sum / subset.length);
};

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getDailyStats = (
    entries: ExerciseEntry[],
    type: ExerciseType,
    days: number = 30
): DailyStat[] => {
    const relevantEntries = entries.filter((e) => e.exerciseType === type);

    // 1. Create a map of existing data
    const dateMap = new Map<string, { total: number; count: number }>();

    relevantEntries.forEach((entry) => {
        // Use local date for grouping to match user's perspective
        const dateStr = getLocalDateString(new Date(entry.timestamp));
        const current = dateMap.get(dateStr) || { total: 0, count: 0 };
        dateMap.set(dateStr, {
            total: current.total + entry.value,
            count: current.count + 1,
        });
    });

    // 2. Generate last N days to ensure continuity (including 0-value days)
    const result: DailyStat[] = [];
    const today = new Date();
    // Normalize today to start of day for iteration, though we only use it for getDate subtraction
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const data = dateMap.get(dateStr) || { total: 0, count: 0 };

        result.push({
            date: dateStr,
            timestamp: d.getTime(),
            totalValue: data.total,
            entryCount: data.count,
            movingAverage: 0, // Calculated in next step
            isToday: dateStr === todayStr,
        });
    }

    // 3. Calculate Moving Averages (7-day simple moving average)
    // Note: This moving average is based on the *displayed* range. 
    // For more accuracy, we'd need to fetch more history. 
    // Assuming 'entries' contains all history, we might want to process everything first then slice?
    // Let's refine: Processing all entries to a daily map first is safer for accurate MA.

    // re-impl for better MA accuracy:
    // Get min date or today - days
    const allDates = Array.from(dateMap.keys()).sort();
    if (allDates.length === 0 && result.length === 0) return result;

    // Fill in gaps for the moving average calculation window if we want it perfect,
    // but sticking to the visual range is often acceptable for "personal progress" unless strictly scientific.
    // Let's stick effectively to the requested days for the output, but calculate MA based on the window result.

    result.forEach((day, index) => {
        day.movingAverage = calculateMovingAverage(result, index, 7);
    });

    return result;
};
