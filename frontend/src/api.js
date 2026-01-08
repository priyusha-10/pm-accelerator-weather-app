const API_URL = 'http://localhost:8000';

export const api = {
    // Fetch current weather from backend
    getCurrentWeather: async (location, unit = 'celsius', startDate = null, endDate = null) => {
        let url = `${API_URL}/weather?location=${encodeURIComponent(location)}&unit=${unit}`;
        if (startDate && endDate) {
            url += `&start_date=${startDate}&end_date=${endDate}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to fetch weather');
        }
        return res.json();
    },

    // Fetch weather by coordinates
    getWeatherByCoordinates: async (lat, lon, unit = 'celsius') => {
        const res = await fetch(`${API_URL}/weather/coordinates?lat=${lat}&lon=${lon}&unit=${unit}`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to fetch weather');
        }
        return res.json();
    },

    // CRUD: Create (Save search)
    saveRecord: async (weatherData) => {
        // Transform complex weather object into flat DB model
        const payload = {
            location: weatherData.location,
            temperature: weatherData.current.temperature_2m,
            description: weatherData.current.weather_code.toString(), // Storing code for now, or could map to text
            date_range: new Date().toISOString().split('T')[0], // Defaulting to today's date for this assessment
            note: ''
        };

        const res = await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Failed to save record');
        return res.json();
    },

    // CRUD: Read (Get history)
    getRecords: async () => {
        const res = await fetch(`${API_URL}/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
    },

    // CRUD: Update (Update a record's note or dates)
    updateRecord: async (id, updates) => {
        const res = await fetch(`${API_URL}/history/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update record');
        return res.json();
    },

    // CRUD: Delete
    deleteRecord: async (id) => {
        const res = await fetch(`${API_URL}/history/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete record');
        return true;
    }
};
