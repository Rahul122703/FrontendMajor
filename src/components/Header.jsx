import { Thermometer, Cloud, Calendar, MapPin, Bot, X } from 'lucide-react';
import { getCurrentSeason } from '../services/api';

const Header = ({ data, lastUpdated, onToggleChat, isChatVisible }) => {
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
    <header className="bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3">
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              <span className="hidden sm:inline">THERMAL EPISODE OF HEATWAVE</span>
              <span className="sm:hidden">HEATWAVE</span>
            </h1>
          </div>
          <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeasonBadgeColor(currentSeason)}`}>
            {currentSeason}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid-level Temperature & Heatwave Prediction</span>
            <span className="sm:hidden">Forecast System</span>
          </div>
          {data && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{data.length} points</span>
            </div>
          )}
          {lastUpdated && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{new Date(lastUpdated).toLocaleTimeString()}</span>
              <span className="xs:hidden">Updated</span>
            </div>
          )}
          
          {/* AI Chat Button */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              isChatVisible 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isChatVisible ? (
              <>
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Close AI</span>
                <span className="sm:hidden">Close</span>
              </>
            ) : (
              <>
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
