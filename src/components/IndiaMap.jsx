import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, User, Info, X, AlertTriangle } from "lucide-react";

const LocationNotification = ({ userLocation, nearestLocation, distance, isVisible, onClose, onShowDetails }) => {
  if (!isVisible || !userLocation || !nearestLocation) return null;

  return (
    <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-1000 max-w-sm backdrop-blur-sm bg-opacity-95">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Your Nearest Location</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Nearest Region</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{nearestLocation.region_name || "Unknown Region"}</p>
          <p className="text-xs text-slate-600 mt-1">Distance: {distance.toFixed(1)} km</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-orange-50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium text-orange-900">Temperature</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {nearestLocation.tmax_pred !== null ? Math.round(nearestLocation.tmax_pred) + "°C" : "N/A"}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium text-red-900">Heatwave Risk</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {nearestLocation.hw_prob !== null ? Math.round(nearestLocation.hw_prob * 100) + "%" : "N/A"}
            </p>
          </div>
        </div>
        
        <button
          onClick={onShowDetails}
          className="w-full bg-slate-100 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Info className="w-4 h-4" />
          View All Data
        </button>
      </div>
    </div>
  );
};

const NearestLocationModal = ({ nearestLocation, distance, isVisible, onClose }) => {
  if (!isVisible || !nearestLocation) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Your Nearest Location</h2>
              </div>
              <p className="text-blue-100 text-lg">{nearestLocation.region_name || "Unknown Region"}</p>
              <p className="text-blue-200 text-sm mt-1">Distance: {distance.toFixed(1)} km away</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-orange-900">Temperature</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {nearestLocation.tmax_pred !== null ? Math.round(nearestLocation.tmax_pred) + "°C" : "N/A"}
              </p>
              <p className="text-xs text-slate-600 mt-1">Predicted Max</p>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-red-900">Heatwave Risk</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {nearestLocation.hw_prob !== null ? Math.round(nearestLocation.hw_prob * 100) + "%" : "N/A"}
              </p>
              <p className="text-xs text-slate-600 mt-1">Probability</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Coordinates</p>
                  <p className="font-semibold text-slate-900">
                    {nearestLocation.lat?.toFixed(4)}, {nearestLocation.lon?.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Lead Day</p>
                  <p className="font-semibold text-slate-900">{nearestLocation.lead || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Heatwave Class</p>
                  <p className="font-semibold text-slate-900">{nearestLocation.hw_pred || "None"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Distance from You</p>
                  <p className="font-semibold text-slate-900">{distance.toFixed(1)} km</p>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Details */}
          <div className="mb-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Issue Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(nearestLocation.issue_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Forecast Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(nearestLocation.forecast_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Days Ahead</p>
                  <p className="font-semibold text-slate-900">
                    {Math.ceil((new Date(nearestLocation.forecast_date) - new Date(nearestLocation.issue_date)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => window.open(`/forecast/${nearestLocation.lat}/${nearestLocation.lon}`, '_blank')}
              className="flex-1 bg-blue-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              View 7-Day Forecast
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HoverCard = ({ point, position, isVisible }) => {
  if (!isVisible || !point) return null;

  const temp = point.tmax_pred;
  const hwProb = point.hw_prob;

  return (
    <div
      className="absolute bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-2000 pointer-events-none backdrop-blur-sm bg-opacity-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
        minWidth: "260px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-blue-600" />
        <h3 className="font-bold text-sm text-slate-900">
          {point.region_name || "Unknown Region"}
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-slate-600 font-medium">Temperature:</span>
          </div>
          <span className="font-bold text-sm text-slate-900">
            {temp !== null ? Math.round(temp) + "°C" : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-slate-600 font-medium">Heatwave Risk:</span>
          </div>
          <span
            className={`font-bold text-sm ${
              hwProb >= 0.6
                ? "text-red-600"
                : hwProb >= 0.4
                  ? "text-orange-500"
                  : hwProb >= 0.2
                    ? "text-yellow-500"
                    : "text-green-500"
            }`}
          >
            {hwProb !== null ? Math.round(hwProb * 100) + "%" : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-600 font-medium">Forecast Date:</span>
          </div>
          <span className="font-bold text-sm text-slate-900">
            {new Date(point.forecast_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-slate-600 font-medium">Lead Day:</span>
          </div>
          <span className="font-bold text-sm text-slate-900">{point.lead}</span>
        </div>
        {point.hw_pred && (
          <div className="flex items-center justify-between bg-red-50 rounded-lg p-2">
            <span className="text-xs text-red-600 font-medium">Heatwave Class:</span>
            <span className="font-bold text-sm text-red-600">{point.hw_pred}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const IndiaMap = ({ data, selectedPoint, onPointClick }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [userLocation, setUserLocation] = useState(null);
  const [nearestLocation, setNearestLocation] = useState(null);
  const [locationNotificationVisible, setLocationNotificationVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearest location to user
  const findNearestLocation = useCallback((userLat, userLon, data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    data.forEach(point => {
      if (point.lat && point.lon) {
        const distance = calculateDistance(userLat, userLon, point.lat, point.lon);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { ...point, distance };
        }
      }
    });
    
    return nearest;
  }, []);

  // Get user location
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          
          // Find nearest location
          const nearest = findNearestLocation(latitude, longitude, data);
          if (nearest) {
            setNearestLocation(nearest);
            setLocationNotificationVisible(true);
            
            // Center map on user location with appropriate zoom
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 8);
            }
          }
          
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          // Fallback to center of India if location access denied
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([20.5937, 78.9629], 5);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setLocationLoading(false);
      // Fallback to center of India
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([20.5937, 78.9629], 5);
      }
    }
  }, [data, findNearestLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [20.5937, 78.9629],
        5,
      );

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri © OpenStreetMap contributors",
        },
      ).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !data || !Array.isArray(data)) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Find min and max temperatures for normalization
    const temps = data.map(point => point.tmax_pred).filter(temp => temp !== null && temp !== undefined);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRangeValue = maxTemp - minTemp || 1; // Avoid division by zero
    
    // Update state for display in UI
    setTempRange({ min: minTemp, max: maxTemp });

    const getTemperatureColor = (temp) => {
      if (temp === null || temp === undefined) return "#94a3b8";
      if (temp < 20) return "#3b82f6";
      if (temp < 25) return "#10b981";
      if (temp < 30) return "#f59e0b";
      if (temp < 35) return "#f97316";
      if (temp < 40) return "#ef4444";
      return "#dc2626";
    };


    data.forEach((point) => {
      const temp = point.tmax_pred;
      const hwProb = point.hw_prob;

      const color = getTemperatureColor(temp);

      const circle = L.circleMarker([point.lat, point.lon], {
        radius: 4 + hwProb * 6, // Smaller base radius: 4-10 instead of 8-20
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7,
        className: "forecast-point cursor-pointer transition-all duration-200",
      });

      const popupContent = `
        <div class="p-2 min-w-50">
          <h3 class="font-bold text-lg mb-2">${point.region_name || "Unknown Region"}</h3>
          <div class="space-y-1 text-sm">
            <div><strong>Coordinates:</strong> ${point.lat.toFixed(2)}, ${point.lon.toFixed(2)}</div>
            <div><strong>Issue Date:</strong> ${new Date(point.issue_date).toLocaleDateString()}</div>
            <div><strong>Forecast Date:</strong> ${new Date(point.forecast_date).toLocaleDateString()}</div>
            <div><strong>Lead Day:</strong> ${point.lead}</div>
            <div><strong>Predicted Temp:</strong> ${temp !== null ? Math.round(temp) + "°C" : "N/A"}</div>
            <div><strong>Heatwave Prob:</strong> ${hwProb !== null ? Math.round(hwProb * 100) + "%" : "N/A"}</div>
            <div><strong>Heatwave Class:</strong> ${point.hw_pred || "None"}</div>
            <div class="mt-2">
              <button class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors" onclick="window.open('/forecast/${point.lat}/${point.lon}', '_blank')">
                View 7-Day Forecast →
              </button>
            </div>
          </div>
        </div>
      `;

      circle._pointData = point;
      circle.bindPopup(popupContent);

      circle.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onPointClick) {
          onPointClick(point);
        }
        navigate(`/forecast/${point.lat}/${point.lon}`);
      });

      circle.on("mouseover", (e) => {
        const point = e.target;
        const latlng = e.latlng;
        const containerPoint =
          mapInstanceRef.current.latLngToContainerPoint(latlng);

        setHoveredPoint(point._pointData);
        setHoverPosition({
          x: containerPoint.x,
          y: containerPoint.y,
        });

        point.setStyle({
          weight: 2.5,
          fillOpacity: 0.9,
          color: "#ffffff",
        });
      });

      circle.on("mouseout", function () {
        setHoveredPoint(null);
        this.setStyle({
          weight: 1.5,
          fillOpacity: 0.7,
          color: "#ffffff",
        });
      });

      circle.addTo(mapInstanceRef.current);
      markersRef.current.push(circle);
    });

      // Add user location marker if available
      if (userLocation && mapInstanceRef.current) {
        const userIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                </div>`,
          className: "user-location-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        
        L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup("Your Location")
          .on('click', () => {
            setDetailsModalVisible(true);
          });
      }

      if (data && data.length > 0 && !userLocation) {
        const bounds = L.latLngBounds(
          data.map((point) => [point.lat, point.lon]),
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
  }, [data, onPointClick, navigate, userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPoint) return;

    mapInstanceRef.current.setView([selectedPoint.lat, selectedPoint.lon], 7);
  }, [selectedPoint]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
    }, 100);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      <div ref={mapRef} className="w-full min-h-[calc(100vh-120px)]" />
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-white p-2.5 rounded-xl shadow-lg border border-slate-200 z-1000 hover:bg-slate-50 transition-all duration-200 hover:shadow-xl"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isFullscreen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          )}
        </svg>
      </button>

      {/* Location loading indicator */}
      {locationLoading && (
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-1000">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-slate-600">Getting your location...</span>
          </div>
        </div>
      )}

      {/* Location notification */}
      <LocationNotification
        userLocation={userLocation}
        nearestLocation={nearestLocation}
        distance={nearestLocation?.distance || 0}
        isVisible={locationNotificationVisible}
        onClose={() => setLocationNotificationVisible(false)}
        onShowDetails={() => setDetailsModalVisible(true)}
      />

      {/* Quick Details Button */}
      {nearestLocation && !locationNotificationVisible && (
        <button
          onClick={() => setDetailsModalVisible(true)}
          className="absolute bottom-20 left-4 bg-blue-600 text-white rounded-xl shadow-lg border border-slate-200 p-3 z-1000 hover:bg-blue-700 transition-all duration-200 hover:shadow-xl flex items-center gap-2"
          title="View nearest location details"
        >
          <Info className="w-4 h-4" />
          <span className="text-sm font-medium">Nearest Location</span>
        </button>
      )}

      {/* Details Modal */}
      <NearestLocationModal
        nearestLocation={nearestLocation}
        distance={nearestLocation?.distance || 0}
        isVisible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
      />

      <div
        className={`absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-1000 ${isFullscreen ? "scale-110" : ""}`}
      >
        <h4 className="font-semibold text-sm mb-2">Temperature Scale</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs">&lt; 20°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs">20-25°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-xs">25-30°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-xs">30-35°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs">35-40°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-700"></div>
            <span className="text-xs">&gt; 40°C</span>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-4 right-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-200 z-1000 ${isFullscreen ? "scale-110" : ""}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h4 className="font-semibold text-sm text-slate-900">Heatwave Risk</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="text-xs text-slate-600">Low (0-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span className="text-xs text-slate-600">Medium (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-400"></div>
            <span className="text-xs text-slate-600">High (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-400"></div>
            <span className="text-xs text-slate-600">Very High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-400"></div>
            <span className="text-xs text-slate-600">Extreme (80-100%)</span>
          </div>
        </div>
      </div>

      <HoverCard
        point={hoveredPoint}
        position={hoverPosition}
        isVisible={!!hoveredPoint}
      />
    </div>
  );
};

export default IndiaMap;
