import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, Navigation } from 'lucide-react';
import { searchCities, findNearestDataPoint } from '../data/indianCities';

const CitySearch = ({ onCitySelect, data, mapInstanceRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [nearestPoint, setNearestPoint] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = searchCities(query);
      setFilteredCities(results);
    } else {
      setFilteredCities([]);
    }
    
    setIsOpen(true);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setIsOpen(false);
    
    // Find nearest data point
    const nearest = findNearestDataPoint(city, data);
    setNearestPoint(nearest);
    
    // Navigate to city on map
    if (mapInstanceRef?.current) {
      mapInstanceRef.current.setView([city.lat, city.lng], 9);
    }
    
    // Call parent callback
    onCitySelect?.(city, nearest);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setNearestPoint(null);
    setFilteredCities([]);
    inputRef.current?.focus();
  };

  const handleNavigateToNearest = () => {
    if (nearestPoint && mapInstanceRef?.current) {
      mapInstanceRef.current.setView([nearestPoint.lat, nearestPoint.lon], 10);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl shadow-sm">
          <div className="pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search city in India..."
            className="w-48 md:w-64 px-3 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 dark:text-gray-200 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2 py-2 text-slate-400 hover:text-slate-600 border-l border-slate-200 dark:border-gray-600"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50">
          {searchQuery.length < 2 ? (
            <div className="p-4 text-sm text-slate-500 text-center">
              Type at least 2 characters to search cities
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="p-4 text-sm text-slate-500 text-center">
              No cities found matching "{searchQuery}"
            </div>
          ) : (
            filteredCities.map((city, index) => (
              <button
                key={index}
                onClick={() => handleCitySelect(city)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-200">
                    {city.name.split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {city.name.split(',')[1]?.trim()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected City Info Card */}
      {selectedCity && nearestPoint && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg p-4 z-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-gray-100">
                {selectedCity.name.split(',')[0]}
              </h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Nearest data point: {nearestPoint.distance.toFixed(1)} km away
              </p>
            </div>
            <button
              onClick={handleNavigateToNearest}
              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
              title="Navigate to nearest data point"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-slate-500 dark:text-gray-400">Temperature</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-gray-100">
                {nearestPoint.tmax_pred ? `${Math.round(nearestPoint.tmax_pred)}°C` : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-slate-500 dark:text-gray-400">Heatwave Risk</p>
              <p className={`text-lg font-semibold ${
                nearestPoint.hw_prob > 0.6 ? 'text-red-600' : 
                nearestPoint.hw_prob > 0.4 ? 'text-orange-500' : 'text-green-600'
              }`}>
                {nearestPoint.hw_prob ? `${Math.round(nearestPoint.hw_prob * 100)}%` : 'N/A'}
              </p>
            </div>
          </div>
          
          {nearestPoint.hw_pred && nearestPoint.hw_pred !== 'None' && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                ⚠️ Heatwave Alert: {nearestPoint.hw_pred}
              </p>
            </div>
          )}
          
          <p className="mt-2 text-xs text-slate-400">
            Coordinates: {selectedCity.lat.toFixed(4)}, {selectedCity.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
