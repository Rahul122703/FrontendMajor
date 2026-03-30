import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import KPICards from './components/KPICards';
import SidebarKPI from './components/SidebarKPI';
import IndiaMap from './components/IndiaMap';
import DetailPanel from './components/DetailPanel';
import AnalyticsCharts from './components/AnalyticsCharts';
import DataTable from './components/DataTable';
import ForecastDetailPage from './components/ForecastDetailPage';
import AIChatAssistant from './components/AIChatAssistant';
import { fetchForecastData } from './services/api';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';

function Dashboard() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeView, setActiveView] = useState('map');
  const [userLocation, setUserLocation] = useState(null);
  const [isAIChatVisible, setIsAIChatVisible] = useState(false);
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(false);
  const [isAIChatMaximized, setIsAIChatMaximized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchForecastData();
        setForecastData(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to load forecast data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePointClick = (point) => {
    setSelectedPoint(point);
  };

  const handleNavigateToCoordinates = (lat, lng) => {
    // This will be passed to IndiaMap to navigate to specific coordinates
    console.log('Navigating to coordinates:', lat, lng);
  };

  const handleShowLocationData = (lat, lng) => {
    // This will find and show data for specific coordinates
    console.log('Showing data for coordinates:', lat, lng);
  };

  const handleGetUserLocation = (location) => {
    setUserLocation(location);
  };

  const handleRowClick = (point) => {
    setSelectedPoint(point);
    setActiveView('map');
  };

  const handleCloseDetail = () => {
    setSelectedPoint(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading forecast data...</p>
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex flex-col h-screen min-h-screen">
      <Header 
        data={forecastData} 
        lastUpdated={lastUpdated}
        onToggleChat={() => setIsAIChatVisible(!isAIChatVisible)}
        isChatVisible={isAIChatVisible}
      />

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Sidebar KPI - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:block lg:flex-shrink-0">
          <SidebarKPI data={forecastData} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 shrink-0">
            <div className="flex space-x-1 sm:space-x-2 lg:space-x-4 overflow-x-auto">
              <button
                onClick={() => setActiveView('map')}
                className={`py-2 sm:py-3 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeView === 'map'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map
                </span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`py-2 sm:py-3 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeView === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </span>
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`py-2 sm:py-3 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeView === 'table'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Table
                </span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeView === 'map' && (
              <div className="h-full p-1 sm:p-2 lg:p-1">
                <IndiaMap 
                  data={forecastData} 
                  selectedPoint={selectedPoint}
                  onPointClick={handlePointClick}
                  onNavigateToCoordinates={handleNavigateToCoordinates}
                  onShowLocationData={handleShowLocationData}
                  onUserLocationUpdate={handleGetUserLocation}
                />
              </div>
            )}
            
            {activeView === 'analytics' && (
              <div className="h-full overflow-y-auto p-2 sm:p-3 pb-20 lg:p-4 lg:p-6">
                <AnalyticsCharts data={forecastData} />
              </div>
            )}
            
            {activeView === 'table' && (
              <div className="h-full overflow-y-auto p-1 sm:p-2 lg:p-4 lg:p-6">
                <DataTable 
                  data={forecastData} 
                  onRowClick={handleRowClick}
                  selectedPoint={selectedPoint}
                />
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel - Bottom sheet on mobile, sidebar on desktop */}
        {selectedPoint && (
          <>
            {/* Mobile Detail Panel - Bottom Sheet */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Location Details</h3>
                <button
                  onClick={handleCloseDetail}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <DetailPanel 
                  selectedPoint={selectedPoint} 
                  onClose={handleCloseDetail}
                />
              </div>
            </div>

            {/* Desktop Detail Panel - Sidebar */}
            <div className="hidden lg:block lg:w-96 xl:w-104 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 shrink-0">
              <DetailPanel 
                selectedPoint={selectedPoint} 
                onClose={handleCloseDetail}
              />
            </div>
          </>
        )}

        {/* Mobile Sidebar KPI - Floating Action */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs opacity-90 hover:opacity-100 transition-opacity">
            <SidebarKPI data={forecastData} mobile={true} />
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AIChatAssistant
        data={forecastData}
        userLocation={userLocation}
        onNavigateToCoordinates={handleNavigateToCoordinates}
        onShowLocationData={handleShowLocationData}
        isVisible={isAIChatVisible}
        onClose={() => setIsAIChatVisible(false)}
        isMinimized={isAIChatMinimized}
        onToggleMinimize={() => setIsAIChatMinimized(!isAIChatMinimized)}
        isMaximized={isAIChatMaximized}
        onToggleMaximize={() => setIsAIChatMaximized(!isAIChatMaximized)}
      />
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forecast/:lat/:lon" element={<ForecastDetailPage />} />
      </Routes>
    </DarkModeProvider>
  );
}

export default App;
