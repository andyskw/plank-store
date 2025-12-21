import { useState, useEffect, useRef } from 'react';
import type { PlankType } from '../types';
import { savePlankEntry } from '../services/storage';
import './PlankTimer.css';

interface PlankTimerProps {
    onSave: () => void;
}

export default function PlankTimer({ onSave }: PlankTimerProps) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [plankType, setPlankType] = useState<PlankType>('regular');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartStop = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
    };

    const handleSave = () => {
        if (time > 0) {
            savePlankEntry(time, plankType);
            setTime(0);
            setIsRunning(false);
            onSave();
        }
    };

    const handleQuickSave = (seconds: number) => {
        savePlankEntry(seconds, plankType);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        setToastMessage(`✓ Saved ${timeStr} plank!`);
        setShowToast(true);
        onSave();
    };

    return (
        <div className="plank-timer">
            <div className="timer-header fade-in">
                <h1>Plank Tracker</h1>
                <p className="subtitle">Track your progress, one plank at a time</p>
            </div>

            <div className="type-selector slide-up">
                <button
                    className={`type-button ${plankType === 'regular' ? 'active regular' : ''}`}
                    onClick={() => setPlankType('regular')}
                >
                    <span className="type-icon">🏋️</span>
                    <span>Regular</span>
                </button>
                <button
                    className={`type-button ${plankType === 'forward-bend' ? 'active forward' : ''}`}
                    onClick={() => setPlankType('forward-bend')}
                >
                    <span className="type-icon">🤸</span>
                    <span>Forward Bend</span>
                </button>
            </div>

            <div className={`timer-display scale-in ${isRunning ? 'running' : ''}`}>
                <div className="time-text">{formatTime(time)}</div>
                <div className="time-label">
                    {isRunning ? 'Keep going!' : time > 0 ? 'Ready to save' : 'Ready to start'}
                </div>
            </div>

            <div className="timer-controls slide-up">
                <button
                    className={`control-button primary ${isRunning ? 'stop' : 'start'}`}
                    onClick={handleStartStop}
                >
                    {isRunning ? '⏸ Stop' : '▶ Start'}
                </button>

                {time > 0 && !isRunning && (
                    <>
                        <button className="control-button save" onClick={handleSave}>
                            ✓ Save
                        </button>
                        <button className="control-button reset" onClick={handleReset}>
                            ↺ Reset
                        </button>
                    </>
                )}
            </div>

            <div className="quick-actions slide-up">
                <div className="section-title">Quick Entry</div>
                <div className="preset-grid">
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(30)}
                    >
                        <span className="preset-time">30s</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(45)}
                    >
                        <span className="preset-time">45s</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(60)}
                    >
                        <span className="preset-time">60s</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(90)}
                    >
                        <span className="preset-time">90s</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(120)}
                    >
                        <span className="preset-time">2m</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(180)}
                    >
                        <span className="preset-time">3m</span>
                    </button>
                </div>
            </div>

            {showToast && (
                <div className="toast">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
