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
import { fetchForecastData } from './services/api';

function Dashboard() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeView, setActiveView] = useState('map');

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

  const handleRowClick = (point) => {
    setSelectedPoint(point);
    setActiveView('map');
  };

  const handleCloseDetail = () => {
    setSelectedPoint(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Header data={forecastData} lastUpdated={lastUpdated} />

      <div className="flex flex-1 overflow-hidden">
        <SidebarKPI data={forecastData} />
        
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 shrink-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveView('map')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'table'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data Table
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeView === 'map' && (
              <div className="h-full p-2 lg:p-1">
                <IndiaMap 
                  data={forecastData} 
                  selectedPoint={selectedPoint}
                  onPointClick={handlePointClick}
                />
              </div>
            )}
            
            {activeView === 'analytics' && (
              <div className="h-full overflow-y-auto p-4 lg:p-6">
                <AnalyticsCharts data={forecastData} />
              </div>
            )}
            
            {activeView === 'table' && (
              <div className="h-full overflow-y-auto p-4 lg:p-6">
                <DataTable 
                  data={forecastData} 
                  onRowClick={handleRowClick}
                  selectedPoint={selectedPoint}
                />
              </div>
            )}
          </div>
        </div>

        {selectedPoint && (
          <div className="w-full lg:w-96 xl:w-104 border-t lg:border-t-0 lg:border-l border-gray-200 shrink-0">
            <DetailPanel 
              selectedPoint={selectedPoint} 
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/forecast/:lat/:lon" element={<ForecastDetailPage />} />
    </Routes>
  );
}

export default App;
