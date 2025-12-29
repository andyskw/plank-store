import { useEffect, useState } from 'react';
import type { ExerciseEntry, PlankVariant, PushupVariant } from '../types';
import { getExerciseEntries, getStatistics, deleteEntry, updateEntry } from '../services/storage';
import { getDailyStats } from '../services/analytics';
import EditEntryModal from './EditEntryModal';
import ProgressCharts from './ProgressCharts';
import './Statistics.css';

interface StatisticsProps {
    refreshTrigger: number;
}

export default function Statistics({ refreshTrigger }: StatisticsProps) {
    const [entries, setEntries] = useState<ExerciseEntry[]>([]);
    const [stats, setStats] = useState(getStatistics());
    const [chartType, setChartType] = useState<'plank' | 'pushup'>('plank');
    const [plankFilters, setPlankFilters] = useState<PlankVariant[]>(['regular', 'forward-bend']);
    const [pushupFilters, setPushupFilters] = useState<PushupVariant[]>(['regular', 'diamond', 'knee']);
    const [editingEntry, setEditingEntry] = useState<ExerciseEntry | null>(null);

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

    const handleUpdateEntry = (updatedEntry: ExerciseEntry) => {
        updateEntry(updatedEntry);
        setEditingEntry(null);
        loadData();
    };

    const getTypeBadgeClass = (type: string) => {
        if (type === 'regular') return 'badge-regular';
        if (type === 'forward-bend') return 'badge-forward';
        if (type === 'diamond') return 'badge-diamond';
        if (type === 'knee') return 'badge-knee';
        return 'badge-regular';
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'regular': return 'Regular';
            case 'forward-bend': return 'Forward Bend';
            case 'diamond': return 'Diamond';
            case 'knee': return 'Knee';
            default: return type;
        }
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
                {chartType === 'plank' ? (
                    <>
                        <div className="type-stat">
                            <span className="type-badge badge-regular">🏋️ Regular</span>
                            <span className="type-total">{formatDuration(stats.regularTotal)}</span>
                        </div>
                        <div className="type-stat">
                            <span className="type-badge badge-forward">🤸 Forward Bend</span>
                            <span className="type-total">{formatDuration(stats.forwardBendTotal)}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="type-stat">
                            <span className="type-badge badge-regular">💪 Regular</span>
                            <span className="type-total">{stats.regularPushupTotal}</span>
                        </div>
                        <div className="type-stat">
                            <span className="type-badge badge-diamond">💎 Diamond</span>
                            <span className="type-total">{stats.diamondPushupTotal}</span>
                        </div>
                        <div className="type-stat">
                            <span className="type-badge badge-knee">🦵 Knee</span>
                            <span className="type-total">{stats.kneePushupTotal}</span>
                        </div>
                    </>
                )}
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
                <div className="filter-controls">
                    {chartType === 'plank' ? (
                        <>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={plankFilters.includes('regular')}
                                    onChange={(e) => {
                                        if (e.target.checked) setPlankFilters([...plankFilters, 'regular']);
                                        else setPlankFilters(plankFilters.filter(f => f !== 'regular'));
                                    }}
                                />
                                Regular
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={plankFilters.includes('forward-bend')}
                                    onChange={(e) => {
                                        if (e.target.checked) setPlankFilters([...plankFilters, 'forward-bend']);
                                        else setPlankFilters(plankFilters.filter(f => f !== 'forward-bend'));
                                    }}
                                />
                                Forward Bend
                            </label>
                        </>
                    ) : (
                        <>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={pushupFilters.includes('regular')}
                                    onChange={(e) => {
                                        if (e.target.checked) setPushupFilters([...pushupFilters, 'regular']);
                                        else setPushupFilters(pushupFilters.filter(f => f !== 'regular'));
                                    }}
                                />
                                Regular
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={pushupFilters.includes('diamond')}
                                    onChange={(e) => {
                                        if (e.target.checked) setPushupFilters([...pushupFilters, 'diamond']);
                                        else setPushupFilters(pushupFilters.filter(f => f !== 'diamond'));
                                    }}
                                />
                                Diamond
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={pushupFilters.includes('knee')}
                                    onChange={(e) => {
                                        if (e.target.checked) setPushupFilters([...pushupFilters, 'knee']);
                                        else setPushupFilters(pushupFilters.filter(f => f !== 'knee'));
                                    }}
                                />
                                Knee
                            </label>
                        </>
                    )}
                </div>
                <ProgressCharts
                    data={getDailyStats(
                        entries.filter(e => {
                            if (chartType === 'plank') {
                                return e.exerciseType === 'plank' && plankFilters.includes(e.variant as PlankVariant);
                            } else {
                                return e.exerciseType === 'pushup' && pushupFilters.includes((e.variant as PushupVariant) || 'regular');
                            }
                        }),
                        chartType
                    )}
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
                                    <span className={`type-badge ${getTypeBadgeClass(entry.variant || 'regular')}`}>
                                        {getTypeLabel(entry.variant || 'regular')}
                                    </span>
                                </div>
                                <div className="entry-actions">
                                    <button
                                        className="edit-button"
                                        onClick={() => setEditingEntry(entry)}
                                        aria-label="Edit entry"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(entry.id)}
                                        aria-label="Delete entry"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {editingEntry && (
                <EditEntryModal
                    entry={editingEntry}
                    onSave={handleUpdateEntry}
                    onCancel={() => setEditingEntry(null)}
                />
            )}
        </div>
    );
}
