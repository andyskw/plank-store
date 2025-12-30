import type { ExerciseEntry, PlankVariant, PushupVariant, Statistics } from '../types';

const STORAGE_KEY = 'exercise_entries';
const OLD_STORAGE_KEY = 'plank_entries';

// Migrate old plank entries to new format
const migrateOldEntries = (): void => {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData && !localStorage.getItem(STORAGE_KEY)) {
        try {
            const oldEntries = JSON.parse(oldData);
            const migratedEntries: ExerciseEntry[] = oldEntries.map((entry: any) => ({
                id: entry.id,
                timestamp: entry.timestamp,
                exerciseType: 'plank' as const,
                value: entry.duration,
                variant: entry.type as PlankVariant,
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedEntries));
        } catch (error) {
            console.error('Error migrating old entries:', error);
        }
    }
};

export const savePlankEntry = (duration: number, variant: PlankVariant, side?: 'left' | 'right'): ExerciseEntry => {
    const entries = getExerciseEntries();
    const newEntry: ExerciseEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        exerciseType: 'plank',
        value: duration,
        variant,
        side,
    };

    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    return newEntry;
};

export const savePushupEntry = (reps: number, variant: PushupVariant = 'regular'): ExerciseEntry => {
    const entries = getExerciseEntries();
    const newEntry: ExerciseEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        exerciseType: 'pushup',
        value: reps,
        variant,
    };

    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    return newEntry;
};

export const getExerciseEntries = (): ExerciseEntry[] => {
    migrateOldEntries();
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading exercise entries:', error);
        return [];
    }
};

// Backward compatibility
export const getPlankEntries = (): ExerciseEntry[] => {
    return getExerciseEntries().filter(e => e.exerciseType === 'plank');
};

export const deleteEntry = (id: string): void => {
    const entries = getExerciseEntries().filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const updateEntry = (updatedEntry: ExerciseEntry): void => {
    const entries = getExerciseEntries().map(entry =>
        entry.id === updatedEntry.id ? updatedEntry : entry
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getStatistics = (): Statistics => {
    const entries = getExerciseEntries();
    const plankEntries = entries.filter(e => e.exerciseType === 'plank');
    const pushupEntries = entries.filter(e => e.exerciseType === 'pushup');

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const todayStart = new Date().setHours(0, 0, 0, 0);

    // Plank statistics
    let todayTotal = 0;
    let weeklyAverage = 0;
    let personalBest = 0;
    let currentStreak = 0;
    let regularTotal = 0;
    let forwardBendTotal = 0;
    let oneSideTotal = 0;

    let regularYesterday = 0;
    let forwardBendYesterday = 0;
    let oneSideYesterday = 0;

    if (plankEntries.length > 0) {
        // Today's total
        const todayPlankEntries = plankEntries.filter(e => e.timestamp >= todayStart);
        todayTotal = todayPlankEntries.reduce((sum, e) => sum + e.value, 0);

        // Weekly average
        const weekAgo = now - oneWeekMs;
        const weekPlankEntries = plankEntries.filter(e => e.timestamp >= weekAgo);
        weeklyAverage = weekPlankEntries.length > 0
            ? Math.round(weekPlankEntries.reduce((sum, e) => sum + e.value, 0) / 7)
            : 0;

        // Personal best
        personalBest = Math.max(...plankEntries.map(e => e.value), 0);

        // Current streak (consecutive days with at least one plank)
        const sortedPlankEntries = [...plankEntries].sort((a, b) => b.timestamp - a.timestamp);
        if (sortedPlankEntries.length > 0) {
            const uniqueDays = new Set<string>();
            sortedPlankEntries.forEach(entry => {
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
        regularTotal = plankEntries
            .filter(e => e.variant === 'regular')
            .reduce((sum, e) => sum + e.value, 0);

        forwardBendTotal = plankEntries
            .filter(e => e.variant === 'forward-bend')
            .reduce((sum, e) => sum + e.value, 0);

        oneSideTotal = plankEntries
            .filter(e => e.variant === 'one-side')
            .reduce((sum, e) => sum + e.value, 0);

        // Yesterday's stats
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayStart = yesterday.getTime();
        const yesterdayEnd = yesterdayStart + oneDayMs;

        const yesterdayPlanks = plankEntries.filter(e =>
            e.timestamp >= yesterdayStart && e.timestamp < yesterdayEnd
        );

        regularYesterday = yesterdayPlanks
            .filter(e => e.variant === 'regular')
            .reduce((sum, e) => sum + e.value, 0);

        forwardBendYesterday = yesterdayPlanks
            .filter(e => e.variant === 'forward-bend')
            .reduce((sum, e) => sum + e.value, 0);

        oneSideYesterday = yesterdayPlanks
            .filter(e => e.variant === 'one-side')
            .reduce((sum, e) => sum + e.value, 0);
    }

    // Pushup statistics
    let todayPushups = 0;
    let weeklyPushupAverage = 0;
    let personalBestPushups = 0;
    let totalPushupReps = 0;

    let regularPushupYesterday = 0;
    let diamondPushupYesterday = 0;
    let kneePushupYesterday = 0;

    if (pushupEntries.length > 0) {
        const todayPushupEntries = pushupEntries.filter(e => e.timestamp >= todayStart);
        todayPushups = todayPushupEntries.reduce((sum, e) => sum + e.value, 0);

        const weekAgo = now - oneWeekMs;
        const weekPushupEntries = pushupEntries.filter(e => e.timestamp >= weekAgo);
        weeklyPushupAverage = weekPushupEntries.length > 0
            ? Math.round(weekPushupEntries.reduce((sum, e) => sum + e.value, 0) / 7)
            : 0;

        personalBestPushups = Math.max(...pushupEntries.map(e => e.value), 0);
        totalPushupReps = pushupEntries.reduce((sum, e) => sum + e.value, 0);
    }

    const regularPushupTotal = pushupEntries
        .filter(e => e.variant === 'regular' || !e.variant)
        .reduce((sum, e) => sum + e.value, 0);

    const diamondPushupTotal = pushupEntries
        .filter(e => e.variant === 'diamond')
        .reduce((sum, e) => sum + e.value, 0);

    const kneePushupTotal = pushupEntries
        .filter(e => e.variant === 'knee')
        .reduce((sum, e) => sum + e.value, 0);

    // Yesterday's pushup stats
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStart = yesterday.getTime();
    const yesterdayEnd = yesterdayStart + oneDayMs;

    const yesterdayPushups = pushupEntries.filter(e =>
        e.timestamp >= yesterdayStart && e.timestamp < yesterdayEnd
    );

    regularPushupYesterday = yesterdayPushups
        .filter(e => e.variant === 'regular' || !e.variant)
        .reduce((sum, e) => sum + e.value, 0);

    diamondPushupYesterday = yesterdayPushups
        .filter(e => e.variant === 'diamond')
        .reduce((sum, e) => sum + e.value, 0);

    kneePushupYesterday = yesterdayPushups
        .filter(e => e.variant === 'knee')
        .reduce((sum, e) => sum + e.value, 0);

    return {
        todayTotal,
        weeklyAverage,
        personalBest,
        currentStreak,
        totalPlanks: plankEntries.length,
        regularTotal,
        forwardBendTotal,
        todayPushups,
        weeklyPushupAverage,
        personalBestPushups,
        totalPushups: pushupEntries.length,
        totalPushupReps,
        regularPushupTotal,
        diamondPushupTotal,
        kneePushupTotal,
        oneSideTotal,
        regularYesterday,
        forwardBendYesterday,
        oneSideYesterday,
        regularPushupYesterday,
        diamondPushupYesterday,
        kneePushupYesterday,
    };
};
