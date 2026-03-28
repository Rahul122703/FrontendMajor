import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Thermometer, MapPin, Calendar, Activity, AlertTriangle } from "lucide-react";

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
  const [tempRange, setTempRange] = useState({ min: 0, max: 0 });

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
      
      // Normalize temperature to 0-1 range
      const normalizedTemp = (temp - minTemp) / tempRangeValue;
      
      // Use smooth color gradient with more granular steps
      if (normalizedTemp < 0.16) {
        // Deep blue to blue (0-16%)
        const intensity = normalizedTemp / 0.16;
        return `rgb(${Math.round(59 + intensity * 0)}, ${Math.round(130 + intensity * 50)}, ${Math.round(246 - intensity * 46)})`;
      } else if (normalizedTemp < 0.33) {
        // Blue to green (16-33%)
        const intensity = (normalizedTemp - 0.16) / 0.17;
        return `rgb(${Math.round(59 + intensity * 67)}, ${Math.round(180 + intensity * 35)}, ${Math.round(200 - intensity * 150)})`;
      } else if (normalizedTemp < 0.5) {
        // Green to yellow (33-50%)
        const intensity = (normalizedTemp - 0.33) / 0.17;
        return `rgb(${Math.round(126 + intensity * 109)}, ${Math.round(215 - intensity * 35)}, ${Math.round(50 + intensity * 10)})`;
      } else if (normalizedTemp < 0.67) {
        // Yellow to orange (50-67%)
        const intensity = (normalizedTemp - 0.5) / 0.17;
        return `rgb(${Math.round(235 + intensity * 18)}, ${Math.round(180 - intensity * 35)}, ${Math.round(60 - intensity * 20)})`;
      } else if (normalizedTemp < 0.83) {
        // Orange to red (67-83%)
        const intensity = (normalizedTemp - 0.67) / 0.16;
        return `rgb(${Math.round(253 - intensity * 14)}, ${Math.round(145 - intensity * 45)}, ${Math.round(40 - intensity * 10)})`;
      } else {
        // Red to dark red (83-100%)
        const intensity = (normalizedTemp - 0.83) / 0.17;
        return `rgb(${Math.round(239 - intensity * 27)}, ${Math.round(100 - intensity * 30)}, ${Math.round(30 - intensity * 10)})`;
      }
    };

    const getHeatwaveColor = (hwProb) => {
      if (hwProb === null || hwProb === undefined) return "#94a3b8";
      if (hwProb < 0.2) return "#10b981";
      if (hwProb < 0.4) return "#f59e0b";
      if (hwProb < 0.6) return "#f97316";
      if (hwProb < 0.8) return "#ef4444";
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

    if (data && data.length > 0) {
      const bounds = L.latLngBounds(
        data.map((point) => [point.lat, point.lon]),
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [data, onPointClick, navigate]);

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

      <div
        className={`absolute bottom-4 left-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-200 z-1000 ${isFullscreen ? "scale-110" : ""}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-4 h-4 text-orange-600" />
          <h4 className="font-semibold text-sm text-slate-900">Temperature Scale</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-600">Min: {Math.round(tempRange.min)}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-linear-to-r from-blue-500 via-green-500 to-red-500"></div>
            <span className="text-xs text-slate-600">Gradient Scale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-700"></div>
            <span className="text-xs text-slate-600">Max: {Math.round(tempRange.max)}°C</span>
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
