import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HoverCard = ({ point, position, isVisible }) => {
  if (!isVisible || !point) return null;

  const temp = point.tmax_pred;
  const hwProb = point.hw_prob;

  return (
    <div
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-2000 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
        minWidth: "220px",
      }}
    >
      <h3 className="font-bold text-sm mb-2 text-gray-900">
        {point.region_name || "Unknown Region"}
      </h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Temperature:</span>
          <span className="font-semibold">
            {temp !== null ? Math.round(temp) + "°C" : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Heatwave Risk:</span>
          <span
            className={`font-semibold ${
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
        <div className="flex justify-between">
          <span className="text-gray-600">Forecast Date:</span>
          <span className="font-semibold">
            {new Date(point.forecast_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Lead Day:</span>
          <span className="font-semibold">{point.lead}</span>
        </div>
        {point.hw_pred && (
          <div className="flex justify-between">
            <span className="text-gray-600">Heatwave Class:</span>
            <span className="font-semibold text-red-600">{point.hw_pred}</span>
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

    const getTemperatureColor = (temp) => {
      if (temp === null || temp === undefined) return "#94a3b8";
      if (temp < 20) return "#3b82f6";
      if (temp < 25) return "#10b981";
      if (temp < 30) return "#f59e0b";
      if (temp < 35) return "#f97316";
      if (temp < 40) return "#ef4444";
      return "#dc2626";
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
      const radius = 8 + hwProb * 12;

      const circle = L.circleMarker([point.lat, point.lon], {
        radius: radius,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        className: "forecast-point cursor-pointer",
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

        this.setStyle({
          weight: 3,
          fillOpacity: 1,
        });
      });

      circle.on("mouseout", function () {
        setHoveredPoint(null);
        this.setStyle({
          weight: 2,
          fillOpacity: 0.8,
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
      className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      <div ref={mapRef} className="w-full min-h-[calc(100vh-120px)]" />
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-1000 hover:bg-gray-50 transition-colors"
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
        className={`absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-1000 ${isFullscreen ? "scale-110" : ""}`}
      >
        <h4 className="font-semibold text-sm mb-2">Size = Heatwave Risk</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-xs">Low (0-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs">Medium (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="text-xs">High (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-400"></div>
            <span className="text-xs">Very High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-400"></div>
            <span className="text-xs">Extreme (80-100%)</span>
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
