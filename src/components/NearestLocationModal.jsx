import { MapPin, X } from "lucide-react";

const NearestLocationModal = ({
  nearestLocation,
  distance,
  isVisible,
  onClose,
}) => {
  if (!isVisible || !nearestLocation) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
              <p className="text-blue-100 text-lg">
                {nearestLocation.region_name || "Unknown Region"}
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Distance: {distance.toFixed(1)} km away
              </p>
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
                <span className="text-sm font-medium text-orange-900">
                  Temperature
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {nearestLocation.tmax_pred !== null
                  ? Math.round(nearestLocation.tmax_pred) + "°C"
                  : "N/A"}
              </p>
              <p className="text-xs text-slate-600 mt-1">Predicted Max</p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-red-900">
                  Heatwave Risk
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {nearestLocation.hw_prob !== null
                  ? Math.round(nearestLocation.hw_prob * 100) + "%"
                  : "N/A"}
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
                    {nearestLocation.lat?.toFixed(4)},{" "}
                    {nearestLocation.lon?.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Lead Day</p>
                  <p className="font-semibold text-slate-900">
                    {nearestLocation.lead || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Heatwave Class</p>
                  <p className="font-semibold text-slate-900">
                    {nearestLocation.hw_pred || "None"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Distance from You</p>
                  <p className="font-semibold text-slate-900">
                    {distance.toFixed(1)} km
                  </p>
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
                  <p className="font-semibold text-slate-900">
                    {formatDate(nearestLocation.issue_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Forecast Date</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(nearestLocation.forecast_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Days Ahead</p>
                  <p className="font-semibold text-slate-900">
                    {Math.ceil(
                      (new Date(nearestLocation.forecast_date) -
                        new Date(nearestLocation.issue_date)) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() =>
                window.open(
                  `/forecast/${nearestLocation.lat}/${nearestLocation.lon}`,
                  "_blank",
                )
              }
              className="flex-1 bg-blue-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              View 7-Day Forecast
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
                  d="M9 5l7 7-7 7"
                />
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

export default NearestLocationModal;
