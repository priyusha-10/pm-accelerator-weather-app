import { useEffect, useState } from 'react';
import { api } from '../api';

function HistoryPanel({ refreshTrigger }) {
    const [history, setHistory] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editNote, setEditNote] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [exportFormat, setExportFormat] = useState('json');

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

    const convertToCSV = (data) => {
        const headers = ["ID", "Location", "Temperature", "Description", "Start Date", "End Date", "Note", "Timestamp"];
        const rows = data.map(item => [
            item.id,
            `"${item.location}"`,
            item.temperature,
            `"${getWeatherDesc(item.description)}"`,
            item.start_date || '',
            item.end_date || '',
            `"${(item.note || '').replace(/"/g, '""')}"`,
            item.timestamp
        ]);
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    };

    const convertToMarkdown = (data) => {
        let md = "| Location | Temp | Condition | Date Range | Note |\n";
        md += "|---|---|---|---|---|\n";
        data.forEach(item => {
            const dateRange = item.start_date && item.end_date ? `${item.start_date} to ${item.end_date}` : '-';
            md += `| ${item.location} | ${Math.round(item.temperature)}° | ${getWeatherDesc(item.description)} | ${dateRange} | ${item.note || '-'} |\n`;
        });
        return md;
    };

    const convertToXML = (data) => {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<weatherHistory>\n';
        data.forEach(item => {
            xml += `  <record>\n`;
            xml += `    <id>${item.id}</id>\n`;
            xml += `    <location>${item.location}</location>\n`;
            xml += `    <temperature>${item.temperature}</temperature>\n`;
            xml += `    <condition>${getWeatherDesc(item.description)}</condition>\n`;
            xml += `    <startDate>${item.start_date || ''}</startDate>\n`;
            xml += `    <endDate>${item.end_date || ''}</endDate>\n`;
            xml += `    <note>${item.note || ''}</note>\n`;
            xml += `    <timestamp>${item.timestamp}</timestamp>\n`;
            xml += `  </record>\n`;
        });
        xml += '</weatherHistory>';
        return xml;
    };

    const handleExport = () => {
        let content = '';
        let type = '';
        let extension = '';

        switch (exportFormat) {
            case 'csv':
                content = convertToCSV(history);
                type = 'text/csv';
                extension = 'csv';
                break;
            case 'md':
                content = convertToMarkdown(history);
                type = 'text/markdown';
                extension = 'md';
                break;
            case 'xml':
                content = convertToXML(history);
                type = 'application/xml';
                extension = 'xml';
                break;
            default:
                content = JSON.stringify(history, null, 2);
                type = 'application/json';
                extension = 'json';
        }

        const link = document.createElement("a");
        link.href = `data:${type};charset=utf-8,${encodeURIComponent(content)}`;
        link.download = `weather_history.${extension}`;
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

    const formatDisplayDate = (start, end) => {
        if (!start || !end) return 'No dates';
        
        // Helper to format "YYYY-MM-DD" to "MMM D"
        const fmt = (d) => {
            const date = new Date(d);
            // Appending 'T00:00' prevents timezone shifts when parsing YYYY-MM-DD
            const localDate = new Date(d + 'T00:00'); 
            return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        if (start === end) return fmt(start);
        return `${fmt(start)} - ${fmt(end)}`;
    };

    return (
        <>
            <div className="history-panel-header">
                <h3 className="history-title">History</h3>
                {history.length > 0 && (
                    <div className="history-controls">
                        <select 
                            value={exportFormat} 
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="history-export-select"
                        >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="md">Markdown</option>
                            <option value="xml">XML</option>
                        </select>
                        <button 
                            onClick={handleExport}
                            className="history-export-btn"
                        >
                            📥 Export
                        </button>
                    </div>
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
                                {/* View Mode: Show Date Range in Header */}
                                {editingId !== item.id && (
                                    <div className="history-meta" style={{ marginTop: '0.2rem' }}>
                                        {item.start_date && item.end_date ? (
                                            <span className="history-date-range" style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                                                {formatDisplayDate(item.start_date, item.end_date)}
                                            </span>
                                        ) : (
                                            <span className="history-date-range" style={{ opacity: 0.5 }}>No date range</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {editingId === item.id ? (
                                    <>
                                        <button className="history-btn save-btn" onClick={() => saveEdit(item.id)} title="Save">✓</button>
                                        <button className="history-btn" onClick={cancelEdit} title="Cancel">✕</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="history-btn" onClick={() => startEdit(item)} title="Edit">✎</button>
                                        <button 
                                            className={`history-btn delete-btn ${deleteConfirmId === item.id ? 'confirm-delete' : ''}`}
                                            onClick={(e) => handleDelete(e, item.id)}
                                            title="Delete"
                                            style={deleteConfirmId === item.id ? { borderColor: '#ff6b6b', color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)' } : {}}
                                        >
                                            {deleteConfirmId === item.id ? 'Sure?' : '🗑️'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Edit Mode: Dedicated Edit Section */}
                        {editingId === item.id ? (
                            <div className="history-edit-section" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem', border: '1px dashed var(--glass-border)' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.8 }}>Edit Date Range</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="date"
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                            style={{ padding: '0.5rem', fontSize: '0.9rem', width: '100%', background: 'rgba(255,255,255,0.05)' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '1rem', opacity: 0.5 }}>→</span>
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="date"
                                            value={editEndDate}
                                            onChange={(e) => setEditEndDate(e.target.value)}
                                            style={{ padding: '0.5rem', fontSize: '0.9rem', width: '100%', background: 'rgba(255,255,255,0.05)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* View Mode: Stats Row */
                            <div className="history-stats-row">
                                <div className="stat-item">
                                    <span className="stat-icon">🌡️</span>
                                    <span className="stat-value">{Math.round(item.temperature)}°C</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <span className="stat-icon">☁️</span>
                                    <span className="stat-value">{getWeatherDesc(item.description)}</span>
                                </div>
                            </div>
                        )}

                        {/* Notes Section */}
                        <div className="history-notes-section">
                            {editingId === item.id ? (
                                <div className="history-note-edit">
                                    <input 
                                        className="history-note-input"
                                        value={editNote} 
                                        onChange={(e) => setEditNote(e.target.value)} 
                                        placeholder="Short note (max 60 chars)..."
                                        maxLength={60}
                                    />
                                    <span style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.2rem', display: 'block', textAlign: 'right' }}>
                                        {editNote.length}/60
                                    </span>
                                </div>
                            ) : (
                                <div className={`history-note-display ${item.note ? 'has-note' : 'no-note'}`}>
                                    {item.note ? (
                                        <span>{item.note}</span>
                                    ) : (
                                        <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No notes added</span>
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
