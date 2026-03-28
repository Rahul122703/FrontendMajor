import { Thermometer, Cloud, Calendar, MapPin, Bot, X, Sun, Moon } from 'lucide-react';
import { getCurrentSeason } from '../services/api';
import { useDarkMode } from '../contexts/DarkModeContext';

const Header = ({ data, lastUpdated, onToggleChat, isChatVisible }) => {
  const currentSeason = getCurrentSeason();
  const { isDark, toggleDarkMode } = useDarkMode();
  
  const getSeasonBadgeColor = (season) => {
    switch (season) {
      case 'Winter': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Pre-monsoon': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Monsoon': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Post-monsoon': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3">
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500 dark:text-red-400" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              <span className="hidden sm:inline">THERMAL EPISODE OF HEATWAVE</span>
              <span className="sm:hidden">HEATWAVE</span>
            </h1>
          </div>
          <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeasonBadgeColor(currentSeason)}`}>
            {currentSeason}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
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
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Toggle dark mode"
          >
            {isDark ? (
              <>
                <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Light</span>
                <span className="sm:hidden">☀️</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dark</span>
                <span className="sm:hidden">🌙</span>
              </>
            )}
          </button>
          
          {/* AI Chat Button */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              isChatVisible 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
