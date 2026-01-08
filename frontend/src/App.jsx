import { useState } from 'react'
import './index.css'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import HistoryPanel from './components/HistoryPanel'
import InfoModal from './components/InfoModal'
import DateRangePicker from './components/DateRangePicker'
import { api } from './api'

function App() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [lastQuery, setLastQuery] = useState(null)
  const [unit, setUnit] = useState('celsius')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const handleSearch = async (location, preferredUnit = unit) => {
    try {
      setError(null)
      setIsLoading(true)
      const data = await api.getCurrentWeather(
        location, 
        preferredUnit, 
        dateRange.start || null, 
        dateRange.end || null
      )
      setCurrentWeather(data)
      setLastQuery({ type: 'text', value: location })
    } catch (err) {
      setError(err.message || "Failed to fetch weather data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSearch = (preferredUnit = unit) => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const data = await api.getWeatherByCoordinates(latitude, longitude, preferredUnit);
                setCurrentWeather(data);
                setLastQuery({ type: 'coords', lat: latitude, lon: longitude })
            } catch (err) {
                setError(err.message || "Failed to fetch weather data");
            } finally {
                setIsLoading(false);
            }
        },
        (err) => {
            console.error(err);
            setError("Unable to retrieve your location");
            setIsLoading(false);
        }
    );
  }

  const toggleUnit = () => {
    const newUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    setUnit(newUnit);
    // Re-fetch if we have a last query
    if (lastQuery) {
        if (lastQuery.type === 'text') handleSearch(lastQuery.value, newUnit);
        else handleLocationSearch(newUnit);
    }
  }

  const handleSave = async (data) => {
    try {
      await api.saveRecord(data)
      setRefreshHistory(prev => prev + 1) // Force history refresh
      alert("Weather data saved!")
    } catch (err) {
      console.error(err)
      alert("Failed to save data")
    }
  }

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
        <h1 style={{ fontSize: '2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Weather AI</h1>
        <p style={{ opacity: 0.8 }}>Real-time forecasts powered by PM Accelerator</p>
        
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '0.5rem' }}>
             <button 
                onClick={toggleUnit}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)' }}
             >
                {unit === 'celsius' ? '°C' : '°F'}
             </button>
             <button 
                onClick={() => setIsInfoOpen(true)}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
             >
                ℹ️ Info
             </button>
        </div>
      </header>
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <section className="glass-panel" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h2>Current Weather</h2>
          </div>
         
          <div className="search-container" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
            <SearchBar onSearch={handleSearch} />
            <button 
                onClick={handleLocationSearch}
                title="Use Current Location"
                className="location-btn"
                disabled={isLoading}
            >
                {isLoading ? '...' : '📍'}
            </button>
          </div>

          <DateRangePicker 
            onDateChange={(start, end) => setDateRange({ start, end })}
            disabled={isLoading}
          />

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(255, 100, 100, 0.2)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,100,100,0.3)' }}>
                ⚠️ {error}
            </div>
          )}

          {currentWeather ? (
            <WeatherCard data={currentWeather} onSave={handleSave} />
          ) : (
            !error && <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '4rem' }}>
              <p>Type a location above to get started.</p>
            </div>
          )}
        </section>

        <aside className="history-sidebar">
          <div className="history-card-container">
            <h3 className="history-title">Search History</h3>
            <HistoryPanel refreshTrigger={refreshHistory} />
          </div>
        </aside>
      </main>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <footer style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.6 }}>
        <p>Built by Antigravity for PM Accelerator Assessment</p>
      </footer>
    </div>
  )
}

export default App
