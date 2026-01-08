import { useState } from 'react';

function SearchBar({ onSearch }) {
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location.trim()) return;

        setIsLoading(true);
        try {
            await onSearch(location);
            setLocation('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="search-bar" style={{ display: 'flex', gap: '10px' }}>
            <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Zip, Landmark, or Lat,Lon..."
                disabled={isLoading}
                style={{ flex: 1 }}
            />
            <button type="submit" disabled={isLoading} style={{ background: 'var(--accent-color)', color: '#333' }}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    );
}

export default SearchBar;
