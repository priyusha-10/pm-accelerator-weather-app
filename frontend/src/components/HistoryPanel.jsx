import { useEffect, useState } from 'react';
import { api } from '../api';

function HistoryPanel({ refreshTrigger }) {
    const [history, setHistory] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editNote, setEditNote] = useState('');

    const loadHistory = async () => {
        try {
            const data = await api.getRecords();
            setHistory(data);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [refreshTrigger]);

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent triggering card clicks if added later
        if (window.confirm('Delete this record?')) {
            await api.deleteRecord(id);
            loadHistory();
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditNote(item.note || '');
    };

    const saveEdit = async (id) => {
        await api.updateRecord(id, { note: editNote });
        setEditingId(null);
        loadHistory();
    };

    const handleExport = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(history, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "weather_history.json";
        link.click();
    };

    const getWeatherIcon = (code) => {
        const c = parseInt(code) || 0;
        if (c <= 1) return '☀️';
        if (c <= 3) return '☁️';
        if (c <= 48) return '🌫️';
        if (c <= 67) return '🌧️';
        if (c <= 77) return '❄️';
        return '⛈️';
    };

    const getWeatherDesc = (code) => {
        const c = parseInt(code) || 0;
        const codes = {
            0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Fog', 48: 'Depositing rime fog',
            51: 'Drizzle: Light', 53: 'Drizzle: Moderate', 55: 'Drizzle: Dense',
            61: 'Rain: Slight', 63: 'Rain: Moderate', 65: 'Rain: Heavy',
            71: 'Snow: Slight', 73: 'Snow: Moderate', 75: 'Snow: Heavy',
            95: 'Thunderstorm',
        };
        return codes[c] || 'Unknown';
    };

    return (
        <div className="history-panel-scroll">
            {history.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
                    <p>No saved searches yet.</p>
                </div>
            )}
            
            {history.map(item => (
                <div key={item.id} className="history-card">
                    {/* Header: Icon + Info */}
                    <div className="history-header">
                        <div className="history-icon-wrapper">
                            {getWeatherIcon(item.description)}
                        </div>
                        <div className="history-info">
                            <h4 className="history-location" title={item.location}>{item.location}</h4>
                            <div className="history-meta">
                                {item.date_range && (
                                    <span className="history-date-range">📅 {item.date_range}</span>
                                )}
                                <span>{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <button 
                            className="history-btn delete-btn" 
                            onClick={(e) => handleDelete(e, item.id)}
                            title="Delete"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="history-stats-grid">
                        <div className="stat-box">
                            <span className="stat-label">Temperature</span>
                            <span className="stat-value">{Math.round(item.temperature)}°C</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Condition</span>
                            <span className="stat-value">{getWeatherDesc(item.description)}</span>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="history-notes-section">
                        {editingId === item.id ? (
                            <div className="history-note-edit">
                                <input 
                                    className="history-note-input"
                                    value={editNote} 
                                    onChange={(e) => setEditNote(e.target.value)} 
                                    placeholder="Add a note..." 
                                    autoFocus
                                />
                                <button className="history-btn save-btn" onClick={() => saveEdit(item.id)}>✓</button>
                            </div>
                        ) : (
                            <div 
                                className={`history-note-display ${item.note ? 'has-note' : 'no-note'}`}
                                onClick={() => startEdit(item)}
                            >
                                {item.note ? (
                                    <span>📝 {item.note}</span>
                                ) : (
                                    <span>+ Add note...</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {history.length > 0 && (
                <button 
                    onClick={handleExport}
                    className="history-export-btn"
                >
                    📥 Export JSON
                </button>
            )}
        </div>
    );
}

export default HistoryPanel;
