import { useState, useEffect } from 'react';
import type { ExerciseEntry, PlankVariant, PushupVariant } from '../types';
import './EditEntryModal.css';

interface EditEntryModalProps {
    entry: ExerciseEntry;
    onSave: (updatedEntry: ExerciseEntry) => void;
    onCancel: () => void;
}

export default function EditEntryModal({ entry, onSave, onCancel }: EditEntryModalProps) {
    const [value, setValue] = useState(entry.value);
    const [variant, setVariant] = useState<string>(entry.variant || 'regular');
    const [side, setSide] = useState<'left' | 'right'>(entry.side || 'left');

    // Reset state when entry changes
    useEffect(() => {
        setValue(entry.value);
        setVariant(entry.variant || 'regular');
        setSide(entry.side || 'left');
    }, [entry]);

    const handleSave = () => {
        onSave({
            ...entry,
            value,
            variant: variant as PlankVariant | PushupVariant,
            side: variant === 'one-side' ? side : undefined,
        });
    };

    const isPlank = entry.exerciseType === 'plank';

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Edit {isPlank ? 'Plank' : 'Pushup'} Entry</h3>

                <div className="form-group">
                    <label>
                        {isPlank ? 'Duration (seconds)' : 'Reps'}
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={value}
                        onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                        className="edit-input"
                    />
                </div>

                <div className="form-group">
                    <label>Variant</label>
                    <div className="variant-options">
                        {isPlank ? (
                            <>
                                <button
                                    className={`variant-option ${variant === 'regular' ? 'active' : ''}`}
                                    onClick={() => setVariant('regular')}
                                >
                                    Regular
                                </button>
                                <button
                                    className={`variant-option ${variant === 'forward-bend' ? 'active' : ''}`}
                                    onClick={() => setVariant('forward-bend')}
                                >
                                    Forward Bend
                                </button>
                                <button
                                    className={`variant-option ${variant === 'one-side' ? 'active' : ''}`}
                                    onClick={() => setVariant('one-side')}
                                >
                                    One-Side
                                </button>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                    {isPlank && variant === 'one-side' && (
                        <div className="side-options">
                            <label className="side-label">Side:</label>
                            <div className="variant-options">
                                <button
                                    className={`variant-option ${side === 'left' ? 'active' : ''}`}
                                    onClick={() => setSide('left')}
                                >
                                    Left
                                </button>
                                <button
                                    className={`variant-option ${side === 'right' ? 'active' : ''}`}
                                    onClick={() => setSide('right')}
                                >
                                    Right
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                    <button className="save-button" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}
