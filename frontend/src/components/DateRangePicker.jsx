import { useState, useEffect } from 'react';

function DateRangePicker({ onDateChange, disabled }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    // Calculate min/max dates (7 days ago to 16 days ahead)
    const getMinDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 16);
        return date.toISOString().split('T')[0];
    };

    const validateDates = (start, end) => {
        if (!start || !end) return true; // Allow empty for "current weather"
        
        const startD = new Date(start);
        const endD = new Date(end);
        const minD = new Date(getMinDate());
        const maxD = new Date(getMaxDate());

        if (startD > endD) {
            setError('Start date must be before end date');
            return false;
        }

        if (startD < minD || endD > maxD) {
            setError('Dates must be within 7 days ago to 16 days ahead');
            return false;
        }

        setError('');
        return true;
    };

    useEffect(() => {
        if (validateDates(startDate, endDate)) {
            onDateChange(startDate, endDate);
        }
    }, [startDate, endDate]);

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        setError('');
    };

    return (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Date Range (Optional)</label>
                {(startDate || endDate) && (
                    <button 
                        onClick={handleClear}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)' }}
                    >
                        Clear
                    </button>
                )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.25rem' }}>Start Date</label>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        disabled={disabled}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    />
                </div>
                
                <span style={{ opacity: 0.5, marginTop: '1.5rem' }}>to</span>
                
                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.25rem' }}>End Date</label>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        disabled={disabled}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    />
                </div>
            </div>

            {error && (
                <p style={{ fontSize: '0.75rem', color: '#ff6b6b', marginTop: '0.5rem', marginBottom: 0 }}>
                    ⚠️ {error}
                </p>
            )}
            
            <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem', marginBottom: 0 }}>
                Leave empty for current weather. Range: 7 days ago to 16 days ahead.
            </p>
        </div>
    );
}

export default DateRangePicker;
