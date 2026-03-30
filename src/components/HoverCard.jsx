import { MapPin, Thermometer, AlertTriangle, Calendar, Activity } from "lucide-react";

const HoverCard = ({ point, position, isVisible }) => {
  if (!isVisible || !point) return null;

  const temp = point.tmax_pred;
  const hwProb = point.hw_prob;

  return (
    <div
      className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 p-4 z-[9999] pointer-events-auto backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
        minWidth: "260px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-sm text-slate-900 dark:text-gray-100">
          {point.region_name || "Unknown Region"}
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">
              Temperature:
            </span>
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-gray-100">
            {temp !== null ? Math.round(temp) + "°C" : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">
              Heatwave Risk:
            </span>
          </div>
          <span
            className={`font-bold text-sm ${
              hwProb >= 0.6
                ? "text-red-600 dark:text-red-400"
                : hwProb >= 0.4
                  ? "text-orange-500 dark:text-orange-400"
                  : hwProb >= 0.2
                    ? "text-yellow-500 dark:text-yellow-400"
                    : "text-green-500 dark:text-green-400"
            }`}
          >
            {hwProb !== null ? Math.round(hwProb * 100) + "%" : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">
              Forecast Date:
            </span>
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-gray-100">
            {new Date(point.forecast_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">
              Lead Day:
            </span>
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-gray-100">
            {point.lead}
          </span>
        </div>
        {point.hw_pred && (
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Heatwave Class:
            </span>
            <span className="font-bold text-sm text-red-600 dark:text-red-400">
              {point.hw_pred}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoverCard;
