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
      const today = new Date().toLocaleDateString('en-CA');
      await api.saveRecord({ 
        ...data, 
        start_date: dateRange.start || today,
        end_date: dateRange.end || today 
      })
      setRefreshHistory(prev => prev + 1) // Force history refresh
      setDateRange({ start: '', end: '' }) // Clear date range
      alert("Weather data saved!")
    } catch (err) {
      console.error(err)
      alert("Failed to save data")
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
            {/* ForecastHub Logo */}
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                {/* Central Sun (The Hub) */}
                <circle cx="32" cy="32" r="12" fill="url(#sunGradient)" />
                
                {/* Top Orbit (Plan Ahead -> Right) */}
                <path d="M16 26C18.5 20 24 16 32 16C40 16 46 20 48 26" stroke="#4DA1FF" strokeWidth="4" strokeLinecap="round" />
                <path d="M48 22L52 26L48 30" stroke="#4DA1FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>

                {/* Bottom Orbit (Look Back <- Left) */}
                <path d="M48 38C45.5 44 40 48 32 48C24 48 18 44 16 38" stroke="#4DA1FF" strokeWidth="4" strokeLinecap="round" />
                <path d="M16 42L12 38L16 34" stroke="#4DA1FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>

                <defs>
                    <linearGradient id="sunGradient" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FDB813"/>
                        <stop offset="1" stopColor="#FF8C00"/>
                    </linearGradient>
                </defs>
            </svg>
            <h1 className="header-title">
                ForecastHub
            </h1>
        </div>
        <p className="header-slogan">Plan Ahead, Look Back</p>
        
        <div className="header-controls">
             <button 
                onClick={toggleUnit}
                className="control-btn"
             >
                {unit === 'celsius' ? '°C' : '°F'}
             </button>
             <button 
                onClick={() => setIsInfoOpen(true)}
                className="control-btn"
             >
                ℹ️ Info
             </button>
        </div>
      </header>
      <main className="app-main-layout">
        <section className="glass-panel" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h2>Current Weather</h2>
          </div>
         
          <div className="search-container" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
            <SearchBar onSearch={handleSearch} />
            <button 
                onClick={() => handleLocationSearch()}
                title="Use Current Location"
                className="location-btn"
                disabled={isLoading}
            >
                {isLoading ? '...' : '📍'}
            </button>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(255, 100, 100, 0.2)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,100,100,0.3)' }}>
                ⚠️ {error}
            </div>
          )}

          {currentWeather ? (
            <WeatherCard 
                data={currentWeather} 
                onSave={handleSave} 
                dateRange={dateRange}
                setDateRange={setDateRange}
                isLoading={isLoading}
            />
          ) : (
            !error && <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '4rem' }}>
              <p>Type a location above to get started.</p>
            </div>
          )}
        </section>

        <aside className="history-sidebar">
          <div className="history-card-container">
            <HistoryPanel refreshTrigger={refreshHistory} />
          </div>
        </aside>
      </main>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <footer style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.6 }}>
        <p>Built by Priyusha Chigurupati for PM Accelerator Assessment</p>
      </footer>
    </div>
  )
}

export default App
