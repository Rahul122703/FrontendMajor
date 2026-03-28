import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { fetchForecastData } from "../services/api";
import {
  formatTemperature,
  formatProbability,
  formatDate,
  formatDateTime,
} from "../utils/formatters";
import { getSeason } from "../services/api";

const ForecastDetailPage = () => {
  const { lat, lon } = useParams();
  const navigate = useNavigate();
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadForecastData = async () => {
      try {
        setLoading(true);
        const data = await fetchForecastData();

        const locationForecasts = data.filter(
          (item) =>
            Math.abs(item.lat - parseFloat(lat)) < 0.01 &&
            Math.abs(item.lon - parseFloat(lon)) < 0.01,
        );

        const sortedForecasts = locationForecasts.sort(
          (a, b) => a.lead - b.lead,
        );
        setForecastData(sortedForecasts);
      } catch (err) {
        setError("Failed to load forecast data");
        console.error("Error loading forecast data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadForecastData();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading 7-day forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (forecastData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            No forecast data available for this location
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const mainForecast = forecastData[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    7-Day Forecast Details
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {mainForecast.region_name} ({parseFloat(lat).toFixed(4)},{" "}
                    {parseFloat(lon).toFixed(4)})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7-Day Temperature Forecast
              </h2>
              <div className="space-y-4">
                {forecastData.map((forecast, index) => {
                  const season = getSeason(forecast.forecast_date);
                  const isToday = index === 0;

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        isToday
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {isToday ? "Today" : `Day ${forecast.lead}`}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(forecast.forecast_date)}
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {season}
                          </span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              forecast.tmax_pred > 35
                                ? "text-red-600 dark:text-red-400"
                                : forecast.tmax_pred > 30
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {formatTemperature(forecast.tmax_pred)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Predicted Max
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Heatwave Risk
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                forecast.hw_prob > 0.6
                                  ? "text-red-600 dark:text-red-400"
                                  : forecast.hw_prob > 0.3
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {formatProbability(forecast.hw_prob)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Heatwave Class
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                forecast.hw_pred && forecast.hw_pred !== "None"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {forecast.hw_pred || "None"}
                            </div>
                          </div>
                        </div>

                        {forecast.tmax_obs !== null &&
                          forecast.tmax_obs !== undefined && (
                            <div className="flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Observed
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {formatTemperature(forecast.tmax_obs)}
                                </div>
                              </div>
                            </div>
                          )}

                        {forecast.error !== null &&
                          forecast.error !== undefined && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Error
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {Math.round(forecast.error * 100) / 100}°C
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Location Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Region</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {mainForecast.region_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Coordinates</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {parseFloat(lat).toFixed(4)}, {parseFloat(lon).toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Region ID</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {mainForecast.region_id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Forecast Summary
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Issue Date</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDateTime(mainForecast.issue_date)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Forecast Range</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(forecastData[0].forecast_date)} -{" "}
                    {formatDate(
                      forecastData[forecastData.length - 1].forecast_date,
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Temperature</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatTemperature(
                      forecastData.reduce(
                        (sum, f) => sum + (f.tmax_pred || 0),
                        0,
                      ) / forecastData.length,
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Temperature</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatTemperature(
                      Math.max(...forecastData.map((f) => f.tmax_pred || 0)),
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Heatwave Days</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {
                      forecastData.filter(
                        (f) => f.hw_pred && f.hw_pred !== "None",
                      ).length
                    }{" "}
                    out of {forecastData.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastDetailPage;
