import { useEffect, useState } from 'react';
import { api } from '../api';

function HistoryPanel({ refreshTrigger }) {
    const [history, setHistory] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editNote, setEditNote] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const loadHistory = async () => {
        try {
            console.log("Loading history...");
            const data = await api.getRecords();
            console.log("History loaded:", data);
            setHistory(data);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [refreshTrigger]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
            if (deleteConfirmId === id) {
                // Second click - actually delete
                try {
                    await api.deleteRecord(id);
                    setDeleteConfirmId(null);
                    loadHistory();
                } catch (err) {
                    console.error("Delete failed:", err);
                    alert("Failed to delete record.");
                }
            } else {
            // First click - show confirmation state
            setDeleteConfirmId(id);
            // Auto-reset after 3 seconds if not confirmed
            setTimeout(() => setDeleteConfirmId(null), 3000);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditNote(item.note || '');
        setEditStartDate(item.start_date || '');
        setEditEndDate(item.end_date || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditNote('');
        setEditStartDate('');
        setEditEndDate('');
    };

    const saveEdit = async (id) => {
        await api.updateRecord(id, { 
            note: editNote,
            start_date: editStartDate,
            end_date: editEndDate
        });
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
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <h3 className="history-title" style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.1rem' }}>Search History</h3>
                {history.length > 0 && (
                    <button 
                        onClick={handleExport}
                        className="history-export-btn"
                        style={{ marginTop: 0, width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                    >
                        📥 Export JSON
                    </button>
                )}
            </div>

            <div className="history-panel-scroll">
                {history.length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
                        <p>No saved searches yet.</p>
                    </div>
                )}
                
                {history.map(item => (
                    <div key={item.id} className="history-card">
                        <div className="history-header">
                            <div className="history-icon-wrapper">
                                {getWeatherIcon(item.description)}
                            </div>
                            <div className="history-info">
                                <h4 className="history-location" title={item.location}>{item.location}</h4>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {editingId === item.id ? (
                                    <>
                                        <button 
                                            className="history-btn save-btn" 
                                            onClick={() => saveEdit(item.id)}
                                            title="Save Changes"
                                        >
                                            ✓
                                        </button>
                                        <button 
                                            className="history-btn" 
                                            onClick={cancelEdit}
                                            title="Cancel"
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="history-btn" 
                                            onClick={() => startEdit(item)}
                                            title="Edit"
                                        >
                                            ✎
                                        </button>
                                        <button 
                                            className={`history-btn delete-btn ${deleteConfirmId === item.id ? 'confirm-delete' : ''}`}
                                            onClick={(e) => handleDelete(e, item.id)}
                                            title={deleteConfirmId === item.id ? "Click again to confirm" : "Delete"}
                                            style={deleteConfirmId === item.id ? { borderColor: '#ff6b6b', color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)' } : {}}
                                        >
                                            {deleteConfirmId === item.id ? 'Sure?' : '🗑️'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Date Range / Edit Inputs - Moved to separate row for full width */}
                        <div className="history-meta">
                            {editingId === item.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <input 
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.8rem' }}
                                    />
                                    <span style={{ alignSelf: 'center', color: 'rgba(255,255,255,0.5)' }}>to</span>
                                    <input 
                                        type="date"
                                        value={editEndDate}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.8rem' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    {item.start_date && item.end_date && (
                                        <span className="history-date-range">📅 {item.start_date} to {item.end_date}</span>
                                    )}
                                </>
                            )}
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
                                    />
                                </div>
                            ) : (
                                <div className={`history-note-display ${item.note ? 'has-note' : 'no-note'}`}>
                                    {item.note ? (
                                        <span>📝 {item.note}</span>
                                    ) : (
                                        <span style={{ opacity: 0.5 }}>...</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default HistoryPanel;
