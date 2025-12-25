import { useEffect, useState } from 'react';
import type { ExerciseEntry } from '../types';
import { getExerciseEntries, getStatistics, deleteEntry } from '../services/storage';
import { getDailyStats } from '../services/analytics';
import ProgressCharts from './ProgressCharts';
import './Statistics.css';

interface StatisticsProps {
    refreshTrigger: number;
}

export default function Statistics({ refreshTrigger }: StatisticsProps) {
    const [entries, setEntries] = useState<ExerciseEntry[]>([]);
    const [stats, setStats] = useState(getStatistics());
    const [chartType, setChartType] = useState<'plank' | 'pushup'>('plank');

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const loadData = () => {
        const allEntries = getExerciseEntries();
        setEntries(allEntries);
        setStats(getStatistics());
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this plank entry?')) {
            deleteEntry(id);
            loadData();
        }
    };

    const getTypeBadgeClass = (type: string) => {
        return type === 'regular' ? 'badge-regular' : 'badge-forward';
    };

    const getTypeLabel = (type: string) => {
        return type === 'regular' ? 'Regular' : 'Forward Bend';
    };

    return (
        <div className="statistics">
            <div className="stats-header fade-in">
                <h2>Your Progress</h2>
                <p className="stats-subtitle">Keep up the great work!</p>
            </div>

            <div className="stats-grid slide-up">
                <div className="stat-card primary">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{formatDuration(stats.todayTotal)}</div>
                    <div className="stat-label">Today's Total</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{formatDuration(stats.weeklyAverage)}</div>
                    <div className="stat-label">Daily Average</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{formatDuration(stats.personalBest)}</div>
                    <div className="stat-label">Personal Best</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-value">{stats.currentStreak}</div>
                    <div className="stat-label">Day Streak</div>
                </div>
            </div>

            <div className="type-stats slide-up">
                <div className="type-stat">
                    <span className="type-badge badge-regular">🏋️ Regular</span>
                    <span className="type-total">{formatDuration(stats.regularTotal)}</span>
                </div>
                <div className="type-stat">
                    <span className="type-badge badge-forward">🤸 Forward Bend</span>
                    <span className="type-total">{formatDuration(stats.forwardBendTotal)}</span>
                </div>
            </div>

            <div className="chart-section slide-up">
                <div className="chart-header">
                    <h3>Activity Trends</h3>
                    <div className="chart-toggles">
                        <button
                            className={`chart-toggle ${chartType === 'plank' ? 'active' : ''}`}
                            onClick={() => setChartType('plank')}
                        >
                            Planks
                        </button>
                        <button
                            className={`chart-toggle ${chartType === 'pushup' ? 'active' : ''}`}
                            onClick={() => setChartType('pushup')}
                        >
                            Pushups
                        </button>
                    </div>
                </div>
                <ProgressCharts
                    data={getDailyStats(entries, chartType)}
                    type={chartType}
                />
            </div>

            <div className="history-section">
                <div className="section-header">
                    <h3>Recent History</h3>
                    <span className="entry-count">{stats.totalPlanks} total planks</span>
                </div>

                <div className="history-list">
                    {entries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <p>No plank entries yet</p>
                            <p className="empty-hint">Start tracking your planks to see your progress!</p>
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <div
                                key={entry.id}
                                className="history-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="entry-main">
                                    <div className="entry-time-info">
                                        <div className="entry-duration">{entry.exerciseType === 'plank' ? formatDuration(entry.value) : `${entry.value} reps`}</div>
                                        <div className="entry-date">
                                            {formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}
                                        </div>
                                    </div>
                                    <span className={`type-badge ${entry.exerciseType === 'plank' ? getTypeBadgeClass(entry.variant || '') : 'badge-pushup'}`}>
                                        {entry.exerciseType === 'plank' ? getTypeLabel(entry.variant || '') : 'Pushup'}
                                    </span>
                                </div>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(entry.id)}
                                    aria-label="Delete entry"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
