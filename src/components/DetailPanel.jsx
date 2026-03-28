import { X, Thermometer, AlertTriangle, Calendar, MapPin, TrendingUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTemperature, formatProbability, formatDate, formatDateTime } from '../utils/formatters';
import { getSeason } from '../services/api';

const DetailPanel = ({ selectedPoint, onClose }) => {
  const navigate = useNavigate();
  
  if (!selectedPoint) return null;

  const season = getSeason(selectedPoint.forecast_date);

  const handleViewFullForecast = () => {
    navigate(`/forecast/${selectedPoint.lat}/${selectedPoint.lon}`);
  };

  const DetailRow = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        <div className={`text-sm font-medium ${color}`}>{value}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Forecast Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-1">
            {selectedPoint.region_name || 'Unknown Region'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {season}
            </span>
            <span className="text-xs text-gray-500">
              Region ID: {selectedPoint.region_id}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <DetailRow
            icon={MapPin}
            label="Coordinates"
            value={`${selectedPoint.lat.toFixed(4)}, ${selectedPoint.lon.toFixed(4)}`}
          />
          <DetailRow
            icon={Calendar}
            label="Issue Date"
            value={formatDateTime(selectedPoint.issue_date)}
          />
          <DetailRow
            icon={Calendar}
            label="Forecast Date"
            value={formatDate(selectedPoint.forecast_date)}
          />
          <DetailRow
            icon={TrendingUp}
            label="Lead Day"
            value={`Day ${selectedPoint.lead}`}
          />
        </div>

        <div className="space-y-1">
          <DetailRow
            icon={Thermometer}
            label="Predicted Temperature"
            value={formatTemperature(selectedPoint.tmax_pred)}
            color={selectedPoint.tmax_pred > 35 ? 'text-red-600' : selectedPoint.tmax_pred > 30 ? 'text-orange-600' : 'text-gray-900'}
          />
          {selectedPoint.tmax_obs !== null && selectedPoint.tmax_obs !== undefined && (
            <DetailRow
              icon={Thermometer}
              label="Observed Temperature"
              value={formatTemperature(selectedPoint.tmax_obs)}
            />
          )}
          {selectedPoint.error !== null && selectedPoint.error !== undefined && (
            <DetailRow
              icon={TrendingUp}
              label="Prediction Error"
              value={`${Math.round(selectedPoint.error * 100) / 100}°C`}
            />
          )}
        </div>

        <div className="space-y-1">
          <DetailRow
            icon={AlertTriangle}
            label="Heatwave Probability"
            value={formatProbability(selectedPoint.hw_prob)}
            color={selectedPoint.hw_prob > 0.6 ? 'text-red-600' : selectedPoint.hw_prob > 0.3 ? 'text-orange-600' : 'text-gray-900'}
          />
          <DetailRow
            icon={AlertTriangle}
            label="Heatwave Class"
            value={selectedPoint.hw_pred || 'None'}
            color={selectedPoint.hw_pred && selectedPoint.hw_pred !== 'None' ? 'text-red-600' : 'text-gray-900'}
          />
        </div>

        <button
          onClick={handleViewFullForecast}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View 7-Day Forecast
        </button>

        {selectedPoint.raw_data && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Raw Data</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono overflow-x-auto">
              {JSON.stringify(selectedPoint.raw_data, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
