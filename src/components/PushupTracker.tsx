import { useState, useEffect } from 'react';
import { savePushupEntry } from '../services/storage';
import type { PushupVariant } from '../types';
import './PushupTracker.css';

interface PushupTrackerProps {
    onSave: () => void;
}

export default function PushupTracker({ onSave }: PushupTrackerProps) {
    const [count, setCount] = useState(0);
    const [variant, setVariant] = useState<PushupVariant>('regular');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleIncrement = (amount: number = 1) => {
        setCount(prev => prev + amount);
    };

    const handleDecrement = () => {
        setCount(prev => Math.max(0, prev - 1));
    };

    const handleReset = () => {
        setCount(0);
    };

    const handleSave = () => {
        if (count > 0) {
            savePushupEntry(count, variant);
            setToastMessage(`✓ Saved ${count} ${variant} pushups!`);
            setShowToast(true);
            setCount(0);
            onSave();
        }
    };

    const handleQuickSave = (reps: number) => {
        savePushupEntry(reps, variant);
        setToastMessage(`✓ Saved ${reps} ${variant} pushups!`);
        setShowToast(true);
        onSave();
    };

    return (
        <div className="pushup-tracker">
            <div className="tracker-header fade-in">
                <h1>Pushup Tracker</h1>
                <p className="subtitle">Build strength, one rep at a time</p>
            </div>

            <div className="counter-display scale-in">
                <div className="count-text">{count}</div>
                <div className="count-label">{variant} pushups</div>
            </div>

            <div className="variant-selector slide-up">
                <button
                    className={`variant-option ${variant === 'regular' ? 'active' : ''}`}
                    onClick={() => setVariant('regular')}
                >
                    Regular
                </button>
                <button
                    className={`variant-option ${variant === 'diamond' ? 'active' : ''}`}
                    onClick={() => setVariant('diamond')}
                >
                    Diamond
                </button>
                <button
                    className={`variant-option ${variant === 'knee' ? 'active' : ''}`}
                    onClick={() => setVariant('knee')}
                >
                    Knee
                </button>
            </div>

            <div className="counter-controls slide-up">
                <button
                    className="counter-button decrement"
                    onClick={handleDecrement}
                    disabled={count === 0}
                >
                    −
                </button>
                <button
                    className="counter-button increment primary"
                    onClick={() => handleIncrement(1)}
                >
                    +1
                </button>
                <button
                    className="counter-button increment-large"
                    onClick={() => handleIncrement(5)}
                >
                    +5
                </button>
            </div>

            {count > 0 && (
                <div className="action-buttons slide-up">
                    <button className="control-button save" onClick={handleSave}>
                        ✓ Save
                    </button>
                    <button className="control-button reset" onClick={handleReset}>
                        ↺ Reset
                    </button>
                </div>
            )}

            <div className="quick-actions slide-up">
                <div className="section-title">Quick Entry</div>
                <div className="preset-grid">
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(10)}
                    >
                        <span className="preset-count">10</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(15)}
                    >
                        <span className="preset-count">15</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(20)}
                    >
                        <span className="preset-count">20</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(25)}
                    >
                        <span className="preset-count">25</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(30)}
                    >
                        <span className="preset-count">30</span>
                    </button>
                    <button
                        className="preset-button"
                        onClick={() => handleQuickSave(50)}
                    >
                        <span className="preset-count">50</span>
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
