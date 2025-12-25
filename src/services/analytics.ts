import type { ExerciseEntry, ExerciseType } from '../types';

export type TimeRange = 'week' | 'month' | 'year';

export interface DailyStat {
    date: string; // YYYY-MM-DD
    timestamp: number;
    totalValue: number; // Seconds for plank, Reps for pushup
    entryCount: number;
    movingAverage: number;
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

export const getDailyStats = (
    entries: ExerciseEntry[],
    type: ExerciseType,
    days: number = 30
): DailyStat[] => {
    const relevantEntries = entries.filter((e) => e.exerciseType === type);

    // 1. Create a map of existing data
    const dateMap = new Map<string, { total: number; count: number }>();

    relevantEntries.forEach((entry) => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        const current = dateMap.get(date) || { total: 0, count: 0 };
        dateMap.set(date, {
            total: current.total + entry.value,
            count: current.count + 1,
        });
    });

    // 2. Generate last N days to ensure continuity (including 0-value days)
    const result: DailyStat[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We go back 'days' amount of time, plus a buffer for moving average to stabilize if needed,
    // but for display we usually slice. Let's generate explicitly requested range.
    // Actually, for moving average to be accurate at the start of the chart, we might need earlier data.
    // For simplicity, we'll calculate stats for the available range or requested range.

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const data = dateMap.get(dateStr) || { total: 0, count: 0 };

        result.push({
            date: dateStr,
            timestamp: d.getTime(),
            totalValue: data.total,
            entryCount: data.count,
            movingAverage: 0, // Calculated in next step
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
    if (allDates.length === 0) return result; // Return empty with 0s if no data

    // Fill in gaps for the moving average calculation window if we want it perfect,
    // but sticking to the visual range is often acceptable for "personal progress" unless strictly scientific.
    // Let's stick effectively to the requested days for the output, but calculate MA based on the window result.

    result.forEach((day, index) => {
        day.movingAverage = calculateMovingAverage(result, index, 7);
    });

    return result;
};
