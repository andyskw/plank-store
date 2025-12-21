import type { PlankEntry, PlankType, Statistics } from '../types';

const STORAGE_KEY = 'plank_entries';

export const savePlankEntry = (duration: number, type: PlankType): PlankEntry => {
    const entries = getPlankEntries();
    const newEntry: PlankEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        duration,
        type,
    };

    entries.unshift(newEntry); // Add to the beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    return newEntry;
};

export const getPlankEntries = (): PlankEntry[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading plank entries:', error);
        return [];
    }
};

export const deleteEntry = (id: string): void => {
    const entries = getPlankEntries().filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getStatistics = (): Statistics => {
    const entries = getPlankEntries();

    if (entries.length === 0) {
        return {
            todayTotal: 0,
            weeklyAverage: 0,
            personalBest: 0,
            currentStreak: 0,
            totalPlanks: 0,
            regularTotal: 0,
            forwardBendTotal: 0,
        };
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    // Today's total
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEntries = entries.filter(e => e.timestamp >= todayStart);
    const todayTotal = todayEntries.reduce((sum, e) => sum + e.duration, 0);

    // Weekly average
    const weekAgo = now - oneWeekMs;
    const weekEntries = entries.filter(e => e.timestamp >= weekAgo);
    const weeklyAverage = weekEntries.length > 0
        ? Math.round(weekEntries.reduce((sum, e) => sum + e.duration, 0) / 7)
        : 0;

    // Personal best
    const personalBest = Math.max(...entries.map(e => e.duration), 0);

    // Current streak (consecutive days with at least one plank)
    let currentStreak = 0;
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

    if (sortedEntries.length > 0) {
        const uniqueDays = new Set<string>();
        sortedEntries.forEach(entry => {
            const day = new Date(entry.timestamp).toDateString();
            uniqueDays.add(day);
        });

        const days = Array.from(uniqueDays).map(day => new Date(day).getTime());
        days.sort((a, b) => b - a);

        let currentDate = new Date().setHours(0, 0, 0, 0);
        for (const day of days) {
            const dayStart = new Date(day).setHours(0, 0, 0, 0);
            if (Math.abs(currentDate - dayStart) <= oneDayMs) {
                currentStreak++;
                currentDate = dayStart - oneDayMs;
            } else {
                break;
            }
        }
    }

    // Type totals
    const regularTotal = entries
        .filter(e => e.type === 'regular')
        .reduce((sum, e) => sum + e.duration, 0);

    const forwardBendTotal = entries
        .filter(e => e.type === 'forward-bend')
        .reduce((sum, e) => sum + e.duration, 0);

    return {
        todayTotal,
        weeklyAverage,
        personalBest,
        currentStreak,
        totalPlanks: entries.length,
        regularTotal,
        forwardBendTotal,
    };
};
