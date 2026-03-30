import { useState } from "react";
import { MapPin, Thermometer, AlertTriangle, User, X, Info } from "lucide-react";

const LocationNotification = ({
  userLocation,
  nearestLocation,
  distance,
  isVisible,
  onClose,
  onShowDetails,
  mapInstanceRef,
}) => {
  const [isCelsius, setIsCelsius] = useState(true);

  if (!isVisible || !userLocation || !nearestLocation) return null;

  const handleTemperatureToggle = () => {
    setIsCelsius(!isCelsius);
  };

  const convertToFahrenheit = (celsius) => {
    return Math.round((celsius * 9) / 5 + 32);
  };

  const displayTemp =
    nearestLocation.tmax_pred !== null
      ? isCelsius
        ? Math.round(nearestLocation.tmax_pred) + "°C"
        : convertToFahrenheit(nearestLocation.tmax_pred) + "°F"
      : "N/A";

  return (
    <div className="absolute top-20 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 p-4 z-1000 max-w-sm backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-gray-100">
            Your Nearest Location
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
              Nearest Region
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-gray-100">
            {nearestLocation.region_name || "Unknown Region"}
          </p>
          <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
            Distance: {distance.toFixed(1)} km away
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Thermometer className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-medium text-orange-900 dark:text-orange-100">
                Temperature
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-gray-100">
              {displayTemp}
            </p>
            <button
              onClick={handleTemperatureToggle}
              className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 mt-1"
            >
              Switch to {isCelsius ? "°F" : "°C"}
            </button>
          </div>

          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-900 dark:text-red-100">
                Heatwave Risk
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-gray-100">
              {nearestLocation.hw_prob !== null
                ? Math.round(nearestLocation.hw_prob * 100) + "%"
                : "N/A"}
            </p>
            {nearestLocation.hw_prob !== null &&
              nearestLocation.hw_prob > 0.4 && (
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  High Risk
                </span>
              )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (mapInstanceRef?.current) {
                mapInstanceRef.current.setView(
                  [nearestLocation.lat, nearestLocation.lon],
                  9,
                );
              }
            }}
            className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg px-3 py-2 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors flex items-center justify-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            View on Map
          </button>
          <button
            onClick={onShowDetails}
            className="flex-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            <Info className="w-3 h-3" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationNotification;
