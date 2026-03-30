import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import NearestLocationModal from "./NearestLocationModal";
import LocationNotification from "./LocationNotification";
import HoverCard from "./HoverCard";
import CitySearchModal from "./CitySearchModal";
import { 
  Thermometer, 
  AlertTriangle, 
  Info, 
  Play, 
  Pause, 
  User,
  MapPin,
} from "lucide-react";

// Import Leaflet CSS dynamically to avoid Vite resolution issues
const importLeafletCSS = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
};

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Temperature color function
const getTemperatureColorFunction = (normalizedTemp) => {
  if (normalizedTemp < 0.2) {
    return "#1e40af"; // Deep blue
  } else if (normalizedTemp < 0.4) {
    return "#06b6d4"; // Cyan
  } else if (normalizedTemp < 0.6) {
    return "#10b981"; // Green
  } else if (normalizedTemp < 0.8) {
    return "#f59e0b"; // Orange
  } else {
    return "#dc2626"; // Red
  }
};

const IndiaMap = ({
  data,
  selectedPoint,
  onPointClick,
  onNavigateToCoordinates,
  onShowLocationData,
  onUserLocationUpdate,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [userLocation, setUserLocation] = useState(null);
  const [nearestLocation, setNearestLocation] = useState(null);
  const [locationNotificationVisible, setLocationNotificationVisible] =
    useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Import Leaflet CSS on component mount
  useEffect(() => {
    importLeafletCSS();
  }, []);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [citySearchModalVisible, setCitySearchModalVisible] = useState(false);
  const [tempRange, setTempRange] = useState({ min: 0, max: 0 });
  const [selectedLeadDay, setSelectedLeadDay] = useState(1);
  const [maxLeadDay, setMaxLeadDay] = useState(1);
  const [showTemperatures, setShowTemperatures] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find nearest location to user
  const findNearestLocation = useCallback((userLat, userLon, data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    data.forEach((point) => {
      if (point.lat && point.lon) {
        const distance = calculateDistance(
          userLat,
          userLon,
          point.lat,
          point.lon,
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { ...point, distance };
        }
      }
    });

    return nearest;
  }, []);

  // Get user location and find max lead day
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    // Find maximum lead day
    const leadDays = data
      .map((point) => point.lead)
      .filter((lead) => lead !== null && lead !== undefined);
    const maxDay = Math.max(...leadDays);
    setTimeout(() => setMaxLeadDay(maxDay), 0);

    setTimeout(() => setLocationLoading(true), 0);

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

          setTimeout(() => setLocationLoading(false), 0);
        },
        (error) => {
          console.error("Error getting location:", error);
          setTimeout(() => setLocationLoading(false), 0);
          // Fallback to center of India if location access denied
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([20.5937, 78.9629], 5);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setTimeout(() => setLocationLoading(false), 0);
      // Fallback to center of India
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([20.5937, 78.9629], 5);
      }
    }
  }, [data, findNearestLocation, maxLeadDay]);

  // Animation effect
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setSelectedLeadDay((prev) => (prev % (maxLeadDay || 1)) + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnimating, maxLeadDay]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [20.5937, 78.9629],
        5,
      );

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: " Esri  OpenStreetMap contributors",
        },
      ).addTo(mapInstanceRef.current);

      // Make map instance globally accessible for LocationNotification
      window.mapInstanceRef = mapInstanceRef;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        window.mapInstanceRef = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !data || !Array.isArray(data)) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter data by selected lead day
    const filteredData = data
      .filter((point) => {
        if (point.lead === selectedLeadDay) return true;
        // If exact day doesn't exist, show the latest available day before selected day
        return point.lead < selectedLeadDay;
      })
      .sort((a, b) => b.lead - a.lead)[0]
      ? data.filter((point) => {
          if (point.lead === selectedLeadDay) return true;
          const latestAvailable = data
            .filter((p) => p.lead < selectedLeadDay)
            .sort((a, b) => b.lead - a.lead)[0];
          return latestAvailable && point.lead === latestAvailable.lead;
        })
      : data.filter((point) => point.lead === selectedLeadDay);

    if (filteredData.length === 0) return;

    // Calculate temperature range for normalization
    const temps = filteredData
      .map((point) => point.tmax_pred)
      .filter((temp) => temp !== null && temp !== undefined);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    // Update state for display in UI
    setTimeout(() => setTempRange({ min: minTemp, max: maxTemp }), 0);

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div class="user-location-marker" style="
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            animation: pulse 2s infinite;
          ">
            <div style="
              background: white;
              border-radius: 50%;
              width: 8px;
              height: 8px;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
        className: "user-location-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lon], {
        icon: userIcon,
      });

      // Create popup for user location
      const userPopupContent = `
        <div class="p-3 min-w-64">
          <h3 class="font-bold text-lg mb-2 text-blue-600">Your Current Location</h3>
          <div class="space-y-2 text-sm">
            <div><strong>Coordinates:</strong> ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}</div>
            <div><strong>Nearest Region:</strong> ${nearestLocation?.region_name || "Finding..."}</div>
            <div><strong>Distance:</strong> ${nearestLocation ? Math.round(nearestLocation.distance) + " km" : "Calculating..."}</div>
            ${
              nearestLocation
                ? `
              <div class="mt-3 p-2 bg-blue-50 rounded-lg">
                <div><strong>Nearest Temp:</strong> ${nearestLocation.tmax_pred !== null ? Math.round(nearestLocation.tmax_pred) + "°C" : "N/A"}</div>
                <div><strong>Heatwave Risk:</strong> ${nearestLocation.hw_prob !== null ? Math.round(nearestLocation.hw_prob * 100) + "%" : "N/A"}</div>
                <div><strong>Heatwave Class:</strong> ${nearestLocation.hw_pred || "None"}</div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;

      userMarker.bindPopup(userPopupContent);

      // Add click handler to show nearest location data
      userMarker.on("click", () => {
        if (nearestLocation) {
          // Show loading state
          const loadingDiv = document.createElement("div");
          loadingDiv.className =
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-lg shadow-lg z-1000";
          loadingDiv.innerHTML = `
            <div class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span class="text-sm text-slate-600">Finding nearest location...</span>
            </div>
          `;
          mapInstanceRef.current.getContainer().appendChild(loadingDiv);

          setTimeout(() => {
            // Center map on nearest location
            mapInstanceRef.current.setView(
              [nearestLocation.lat, nearestLocation.lon],
              9,
            );

            // Trigger the point click to show details
            onPointClick && onPointClick(nearestLocation);

            // Open the nearest location's popup
            setTimeout(() => {
              const nearestMarker = markersRef.current.find((marker) => {
                const pos = marker.getLatLng();
                return (
                  Math.abs(pos.lat - nearestLocation.lat) < 0.01 &&
                  Math.abs(pos.lng - nearestLocation.lng) < 0.01
                );
              });
              if (nearestMarker) {
                nearestMarker.openPopup();
              }
              // Remove loading indicator
              if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
              }
            }, 1000);
          }, 500);
        }
      });

      // Add hover effects
      userMarker.on("mouseover", function () {
        const element = this.getElement();
        if (element) {
          element.style.transform = "scale(1.2)";
          element.style.zIndex = "1000";
        }
      });

      userMarker.on("mouseout", function () {
        const element = this.getElement();
        if (element) {
          element.style.transform = "scale(1)";
          element.style.zIndex = "500";
        }
      });

      userMarker.addTo(mapInstanceRef.current);
      markersRef.current.push(userMarker);
    }

    if (showTemperatures) {
      // Show temperature labels instead of circles
      filteredData.forEach((point) => {
        const temp = point.tmax_pred;

        if (temp !== null && temp !== undefined) {
          const tempIcon = L.divIcon({
            html: `<div class="text-xs font-bold text-white" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${Math.round(temp)}°</div>`,
            className: "temperature-marker cursor-pointer",
            iconSize: [20, 14],
            iconAnchor: [10, -7],
          });

          const tempMarker = L.marker([point.lat, point.lon], {
            icon: tempIcon,
          });

          tempMarker.on("mouseover", function (e) {
            setHoveredPoint(point);
            const point_xy = mapInstanceRef.current.latLngToContainerPoint(
              e.target.getLatLng(),
            );
            const mapRect = mapInstanceRef.current
              .getContainer()
              .getBoundingClientRect();
            setHoverPosition({
              x: point_xy.x + mapRect.left,
              y: point_xy.y + mapRect.top,
            });
          });

          tempMarker.on("mousemove", function (e) {
            const containerPoint = mapInstanceRef.current.latLngToContainerPoint(
              e.latlng,
            );
            const mapRect = mapInstanceRef.current
              .getContainer()
              .getBoundingClientRect();
            setHoverPosition({
              x: containerPoint.x + mapRect.left,
              y: containerPoint.y + mapRect.top,
            });
          });

          tempMarker.on("mouseout", function () {
            setHoveredPoint(null);
          });

          tempMarker.on("click", () => {
            onPointClick && onPointClick(point);
          });

          tempMarker.addTo(mapInstanceRef.current);
          markersRef.current.push(tempMarker);
        }
      });
    } else {
      // Show circles (normal mode)
      filteredData.forEach((point) => {
        const temp = point.tmax_pred;
        const hwProb = point.hw_prob || 0;

        // Normalize temperature for color calculation
        const normalizedTemp =
          maxTemp !== minTemp ? (temp - minTemp) / (maxTemp - minTemp) : 0.5;
        const color = getTemperatureColorFunction(normalizedTemp);

        const circle = L.circleMarker([point.lat, point.lon], {
          radius: 4 + hwProb * 10, // Smaller base radius: 4-10 instead of 8-20
          fillColor: color,
          color: "#ffffff",
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.7,
          pane: "markerPane",
          className:
            "forecast-point cursor-pointer transition-all duration-200",
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
          </div>
        </div>
      `;

        circle.bindPopup(popupContent);

        circle.on("mouseover", function (e) {
          console.log("hover working");

          setHoveredPoint(point);

          const containerPoint = mapInstanceRef.current.latLngToContainerPoint(
            e.target.getLatLng(),
          );

          const mapRect = mapInstanceRef.current
            .getContainer()
            .getBoundingClientRect();

          setHoverPosition({
            x: containerPoint.x + mapRect.left,
            y: containerPoint.y + mapRect.top,
          });
        });
        circle.on("mousemove", function (e) {
          const containerPoint = mapInstanceRef.current.latLngToContainerPoint(
            e.latlng,
          );

          const mapRect = mapInstanceRef.current
            .getContainer()
            .getBoundingClientRect();

          setHoverPosition({
            x: containerPoint.x + mapRect.left,
            y: containerPoint.y + mapRect.top,
          });
        });
        circle.on("mouseout", function () {
          setHoveredPoint(null);
        });

        circle.on("click", () => {
          onPointClick && onPointClick(point);
        });

        circle.addTo(mapInstanceRef.current);
        markersRef.current.push(circle);
      });
    }

    // Fit map to data bounds only on initial load, not on slider change
    if (filteredData.length > 0 && !mapInstanceRef.current._dataLoaded) {
      const bounds = L.latLngBounds(
        filteredData.map((point) => [point.lat, point.lon]),
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      mapInstanceRef.current._dataLoaded = true;
    }
  }, [
    data,
    selectedLeadDay,
    showTemperatures,
    onPointClick,
    userLocation,
    nearestLocation,
  ]);

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

  // Add coordinate navigation from AI responses
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !onNavigateToCoordinates ||
      !onShowLocationData
    )
      return;

    // This will be called when AI provides coordinates
    window.handleAINavigation = (lat, lng) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 10);

        // Find nearest data point
        const nearest = findNearestLocation(lat, lng, data);
        if (nearest) {
          onPointClick && onPointClick(nearest);
          onShowLocationData(lat, lng);
        }
      }
    };

    return () => {
      window.handleAINavigation = null;
    };
  }, [
    mapInstanceRef,
    onNavigateToCoordinates,
    onShowLocationData,
    data,
    onPointClick,
    findNearestLocation,
  ]);

  // Update user location when parent requests
  useEffect(() => {
    if (onUserLocationUpdate && userLocation) {
      onUserLocationUpdate(userLocation);
    }
  }, [userLocation, onUserLocationUpdate]);

  const toggleFullscreen = async () => {
    const mapElement = mapRef.current;

    if (!document.fullscreenElement) {
      try {
        if (mapElement.requestFullscreen) {
          await mapElement.requestFullscreen();
        } else if (mapElement.webkitRequestFullscreen) {
          await mapElement.webkitRequestFullscreen();
        } else if (mapElement.msRequestFullscreen) {
          await mapElement.msRequestFullscreen();
        }
        setIsFullscreen(true);
        // Force map to resize after entering fullscreen
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      } catch (error) {
        console.error("Error attempting to enable fullscreen:", error);
        // Fallback to CSS-only fullscreen on parent
        const mapContainer = mapElement.parentElement;
        if (mapContainer) {
          setIsFullscreen(true);
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 200);
        }
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
        // Force map to resize after exiting fullscreen
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      } catch (error) {
        console.error("Error attempting to exit fullscreen:", error);
        // Fallback to CSS-only fullscreen
        setIsFullscreen(false);
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      }
    }
  };

  // Handle fullscreen change events and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Force map to resize when fullscreen state changes
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          // Also try to force a redraw
          mapInstanceRef.current.eachLayer((layer) => {
            if (layer.redraw) {
              layer.redraw();
            }
          });
        }
      }, 300);
    };

    const handleKeyDown = (event) => {
      // ESC key exits fullscreen
      if (event.key === "Escape" && document.fullscreenElement) {
        toggleFullscreen();
      }
      // 'F' key toggles fullscreen when map is focused
      if ((event.key === "f" || event.key === "F") && event.ctrlKey) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-lg ${
        isFullscreen ? "fixed inset-0 z-40 rounded-none bg-black" : ""
      }`}
    >
      <div
        ref={mapRef}
        className={`w-full ${
          isFullscreen ? "h-screen" : "min-h-[calc(100vh-120px)]"
        }`}
        style={{
          backgroundColor: isFullscreen ? "black" : "transparent",
        }}
      />

      {/* Temperature Toggle Button */}
      <button
        onClick={() => setShowTemperatures(!showTemperatures)}
        className="absolute top-4 left-15 bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-1000 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-xl flex items-center gap-2"
        title={showTemperatures ? "Show Circles" : "Show Temperatures"}
      >
        <Thermometer
          className={`w-4 h-4 ${showTemperatures ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
        />
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {showTemperatures ? "Temp" : "Circles"}
        </span>
      </button>

      {/* City Search Button */}
      <button
        onClick={() => setCitySearchModalVisible(true)}
        className="absolute top-20 left-1 bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-1000 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-xl flex items-center gap-2"
        title="Search Indian Cities"
      >
        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
          Search City
        </span>
      </button>

      {/* Animation Control */}
      <button
        onClick={() => setIsAnimating(!isAnimating)}
        className={`absolute top-4 right-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-1000 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-xl flex items-center gap-2 ${
          isAnimating
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
        }`}
        title={isAnimating ? "Stop Animation" : "Start Animation"}
      >
        {isAnimating ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {isAnimating ? "Stop" : "Animate"}
        </span>
      </button>

      {/* My Location Button */}
      {!locationLoading && (
        <button
          onClick={() => {
            if (navigator.geolocation) {
              setLocationLoading(true);
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setUserLocation({ lat: latitude, lon: longitude });

                  // Find nearest location
                  const nearest = findNearestLocation(
                    latitude,
                    longitude,
                    data,
                  );
                  if (nearest) {
                    setNearestLocation(nearest);
                    setLocationNotificationVisible(true);

                    // Center map on user location
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([latitude, longitude], 8);
                    }
                  }

                  setLocationLoading(false);
                },
                (error) => {
                  console.error("Error getting location:", error);
                  setLocationLoading(false);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 300000,
                },
              );
            }
          }}
          className="absolute top-4 left-38 bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-1200 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:shadow-xl flex items-center gap-2"
          title="Find my current location"
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium text-white">My Location</span>
        </button>
      )}

      {/* Location notification */}
      <LocationNotification
        userLocation={userLocation}
        nearestLocation={nearestLocation}
        distance={nearestLocation?.distance || 0}
        isVisible={locationNotificationVisible}
        onClose={() => setLocationNotificationVisible(false)}
        onShowDetails={() => setDetailsModalVisible(true)}
        mapInstanceRef={mapInstanceRef}
      />

      {/* Quick Details Button */}
      {nearestLocation && !locationNotificationVisible && (
        <button
          onClick={() => setDetailsModalVisible(true)}
          className="absolute bottom-20 left-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 p-3 z-1200 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:shadow-xl flex items-center gap-2"
          title="View nearest location details"
        >
          <Info className="w-4 h-4" />
          <span className="text-sm font-medium text-white">Details</span>
        </button>
      )}

      {/* Temperature Scale - Hidden on mobile */}
      <div
        className={`hidden sm:block absolute bottom-14 left-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 z-1300 ${isFullscreen ? "scale-110" : ""}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-gray-100">
            Temperature Scale
          </h4>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Min: {Math.round(tempRange.min)}°C
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Gradient Scale
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-700"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Max: {Math.round(tempRange.max)}°C
            </span>
          </div>
        </div>
      </div>

      {/* Heatwave Risk - Hidden on mobile */}
      <div
        className={`hidden sm:block absolute bottom-14 right-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 z-1000 ${isFullscreen ? "scale-110" : ""}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-gray-100">
            Heatwave Risk
          </h4>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400 dark:bg-gray-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Low (0-20%)
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-400 dark:bg-gray-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Medium (20-40%)
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-slate-400 dark:bg-gray-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              High (40-60%)
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-slate-400 dark:bg-gray-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Very High (60-80%)
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3.5 h-3.5 sm:w-6 sm:h-6 rounded-full bg-slate-400 dark:bg-gray-500"></div>
            <span className="text-xs text-slate-600 dark:text-gray-300">
              Extreme (80-100%)
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Slider - Adjusted for mobile */}
      <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 sm:p-3 z-1000 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
            Day {selectedLeadDay}/{maxLeadDay}
          </span>
          <input
            type="range"
            min="1"
            max={maxLeadDay}
            value={selectedLeadDay}
            onChange={(e) => setSelectedLeadDay(parseInt(e.target.value))}
            className="flex-1 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {createPortal(
        <HoverCard
          point={hoveredPoint}
          position={hoverPosition}
          isVisible={!!hoveredPoint}
        />,
        document.body,
      )}

      <NearestLocationModal
        nearestLocation={nearestLocation}
        distance={nearestLocation?.distance || 0}
        isVisible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
      />

      {/* City Search Modal - appears over the map */}
      <CitySearchModal
        isOpen={citySearchModalVisible}
        onClose={() => setCitySearchModalVisible(false)}
        data={data}
        mapInstanceRef={mapInstanceRef}
        onPointClick={onPointClick}
        setNearestLocation={setNearestLocation}
        setLocationNotificationVisible={setLocationNotificationVisible}
      />
    </div>
  );
};

export default IndiaMap;
