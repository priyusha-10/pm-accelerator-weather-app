import React from 'react';
import DateRangePicker from './DateRangePicker';

function WeatherCard({ data, onSave, dateRange, setDateRange, isLoading }) {
    if (!data) return null;

    const { location, current, daily, current_units, date_range } = data;
    const tempUnit = current_units?.temperature_2m || '°C';
    const hasCurrentWeather = current && current.temperature_2m !== undefined;
    
    // Mapping WMO weather codes to descriptions (simplified)
    const getWeatherDesc = (code) => {
        const codes = {
            0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Fog', 48: 'Depositing rime fog',
            51: 'Drizzle: Light', 53: 'Drizzle: Moderate', 55: 'Drizzle: Dense',
            61: 'Rain: Slight', 63: 'Rain: Moderate', 65: 'Rain: Heavy',
            71: 'Snow: Slight', 73: 'Snow: Moderate', 75: 'Snow: Heavy',
            95: 'Thunderstorm: Slight or moderate',
        };
        return codes[code] || 'Unknown';
    };

    const getIcon = (c) => {
        if (c <= 1) return '☀️';
        if (c <= 3) return '☁️';
        if (c <= 48) return '🌫️';
        if (c <= 67) return '🌧️';
        if (c <= 77) return '❄️';
        return '⛈️';
    };

    // For historical/date range queries, use first day's data
    const displayTemp = hasCurrentWeather ? current.temperature_2m : daily.temperature_2m_max?.[0];
    const displayCode = hasCurrentWeather ? current.weather_code : daily.weather_code?.[0];

    return (
        <div className="weather-card" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', margin: 0 }}>{location}</h2>
                    {date_range && (
                        <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0.25rem 0' }}>
                            📅 {date_range}
                        </p>
                    )}
                    <p style={{ opacity: 0.8 }}>{getWeatherDesc(displayCode)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '3.5rem' }}>{getIcon(displayCode)}</span>
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ fontSize: '3.5rem', margin: 0 }}>{Math.round(displayTemp)}{tempUnit}</h1>
                        <p>H: {Math.round(daily.temperature_2m_max[0])}° L: {Math.round(daily.temperature_2m_min[0])}°</p>
                    </div>
                </div>
            </div>

            {hasCurrentWeather && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Wind</p>
                    <p style={{ fontWeight: 'bold' }}>{current.wind_speed_10m} km/h</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Humidity</p>
                    <p style={{ fontWeight: 'bold' }}>{current.relative_humidity_2m}%</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Date</p>
                    <p style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</p>
                </div>
            </div>
            )}

            {/* Daily Forecast - Show all days in range or next 7 days */}
            <div className="forecast-section" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'left' }}>
                    {date_range ? 'Daily Weather' : '7-Day Forecast'}
                </h3>
                <div className="forecast-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(daily.time?.length || 7, 7)}, 1fr)`, gap: '0.5rem' }}>
                    {(date_range ? daily.time : daily.time.slice(1, 9)).map((time, i) => {
                        const index = date_range ? i : i + 1;
                        const date = new Date(time);
                        const code = daily.weather_code ? daily.weather_code[index] : 0;
                        const max = daily.temperature_2m_max ? daily.temperature_2m_max[index] : 0;
                        const min = daily.temperature_2m_min ? daily.temperature_2m_min[index] : 0;
                        const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[index] : 0;
                        
                        return (
                            <div key={time} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 0.4rem', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p style={{ fontSize: '1.5rem', margin: '0.3rem 0' }} title={getWeatherDesc(code)}>{getIcon(code)}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.2rem' }}>
                                    {getWeatherDesc(code)}
                                </p>
                                <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>{Math.round(max)}°</span> <span style={{ opacity: 0.7 }}>{Math.round(min)}°</span>
                                </p>
                                {precip > 0 && (
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        💧 {precip}%
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Date Picker (Moved Below Forecast) */}
            <div style={{ marginTop: '1.5rem' }}>
                <DateRangePicker 
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onDateChange={(start, end) => setDateRange({ start, end })}
                    disabled={isLoading}
                />
            </div>

            <button 
                onClick={() => onSave(data)} 
                style={{ marginTop: '1.5rem', width: '100%', background: 'rgba(255,255,255,0.2)' }}
            >
                Save to History
            </button>

            {/* Location Map */}
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'left' }}>
                    🗺️ Map View: {location}
                </h3>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                   <iframe 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', filter: 'invert(90%) hue-rotate(180deg)' }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        title={`Map of ${location}`}
                        loading="lazy"
                    ></iframe>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.6, marginTop: '0.5rem' }}>
                    Live map data from Google Maps
                </p>
            </div>
        </div>
    );
}

export default WeatherCard;
