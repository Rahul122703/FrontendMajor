import { Thermometer, Cloud, Calendar, MapPin } from 'lucide-react';
import { getCurrentSeason } from '../services/api';

const Header = ({ data, lastUpdated }) => {
  const currentSeason = getCurrentSeason();
  
  const getSeasonBadgeColor = (season) => {
    switch (season) {
      case 'Winter': return 'bg-blue-100 text-blue-800';
      case 'Pre-monsoon': return 'bg-yellow-100 text-yellow-800';
      case 'Monsoon': return 'bg-green-100 text-green-800';
      case 'Post-monsoon': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-6 h-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              THERMAL EPISODE OF HEATWAVE
            </h1>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeasonBadgeColor(currentSeason)}`}>
            {currentSeason}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Cloud className="w-4 h-4" />
            <span>Grid-level Temperature & Heatwave Prediction</span>
          </div>
          {data && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{data.length} forecast points</span>
            </div>
          )}
          {lastUpdated && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
