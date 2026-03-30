import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, Navigation } from 'lucide-react';
import L from 'leaflet';
import { searchCities, findNearestDataPoint } from '../data/indianCities';

const CitySearchModal = ({ isOpen, onClose, data, mapInstanceRef, onPointClick, setNearestLocation, setLocationNotificationVisible }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [nearestPoint, setNearestPoint] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedCity(null);
    setNearestPoint(null);
    
    if (query.length >= 2) {
      const results = searchCities(query);
      setFilteredCities(results);
      setShowResults(true);
    } else {
      setFilteredCities([]);
      setShowResults(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setShowResults(false);
    
    // Find nearest data point
    const nearest = findNearestDataPoint(city, data);
    setNearestPoint(nearest);
    
    // Navigate to city on map
    if (mapInstanceRef?.current) {
      mapInstanceRef.current.setView([city.lat, city.lng], 9);
    }
    
    // Update parent state
    if (nearest) {
      setNearestLocation(nearest);
      setLocationNotificationVisible(true);
      onPointClick && onPointClick(nearest);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setNearestPoint(null);
    setFilteredCities([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNavigateToNearest = () => {
    if (nearestPoint && mapInstanceRef?.current) {
      mapInstanceRef.current.setView([nearestPoint.lat, nearestPoint.lon], 10);
      
      // Add a marker at the location
      const marker = L.circleMarker([nearestPoint.lat, nearestPoint.lon], {
        radius: 12,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current);
      
      // Add popup with location info
      marker.bindPopup(`
        <div class="p-2">
          <strong>${selectedCity?.name?.split(',')[0] || 'Selected Location'}</strong><br/>
          Temp: ${nearestPoint.tmax_pred ? Math.round(nearestPoint.tmax_pred) + '°C' : 'N/A'}<br/>
          Heatwave Risk: ${nearestPoint.hw_prob ? Math.round(nearestPoint.hw_prob * 100) + '%' : 'N/A'}
        </div>
      `).openPopup();
      
      // Remove marker after 5 seconds
      setTimeout(() => {
        marker.remove();
      }, 5000);
      
      // Close modal after navigating
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">
              Search Indian Cities
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative">
            <div className="flex items-center bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search city in India..."
                className="w-full px-3 py-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 dark:text-gray-200 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 dark:hover:bg-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dropdown Results */}
          {showResults && (
            <div className="mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg max-h-[140px] overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">
                  No cities found matching "{searchQuery}"
                </div>
              ) : (
                filteredCities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-gray-700 last:border-0"
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
            <div className="mt-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl p-4">
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
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-gray-400">Temperature</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-gray-100">
                    {nearestPoint.tmax_pred ? `${Math.round(nearestPoint.tmax_pred)}°C` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitySearchModal;
