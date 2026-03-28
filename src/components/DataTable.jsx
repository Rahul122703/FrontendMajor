import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Thermometer, AlertTriangle, Calendar, MapPin, Filter } from 'lucide-react';
import { formatTemperature, formatProbability, formatDate } from '../utils/formatters';

const DataTable = ({ data, onRowClick, selectedPoint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data || [];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.region_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.region_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.hw_pred || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tmax_pred && item.tmax_pred.toString().includes(searchTerm))
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const getTemperatureColor = (temp) => {
    if (temp === null || temp === undefined) return 'text-gray-500 dark:text-gray-400';
    if (temp > 40) return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (temp > 35) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (temp > 30) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (temp > 25) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  const getRiskColor = (prob) => {
    if (prob === null || prob === undefined) return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    if (prob > 0.8) return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (prob > 0.6) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (prob > 0.4) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (prob > 0.2) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const columns = [
    { key: 'region_name', label: 'Region', sortable: true, icon: MapPin },
    { key: 'region_id', label: 'ID', sortable: true },
    { key: 'tmax_pred', label: 'Temperature', sortable: true, icon: Thermometer },
    { key: 'hw_prob', label: 'Heatwave Risk', sortable: true, icon: AlertTriangle },
    { key: 'hw_pred', label: 'Class', sortable: true },
    { key: 'lead', label: 'Lead Day', sortable: true },
    { key: 'forecast_date', label: 'Forecast Date', sortable: true, icon: Calendar }
  ];

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-300">No forecast data found for the current selection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
      {/* Header Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">Forecast Data Table</h2>
            <p className="text-blue-100 text-xs sm:text-sm">
              {filteredAndSortedData.length} of {data.length} records
            </p>
          </div>
          <div className="relative w-full lg:w-64 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
            <input
              type="text"
              placeholder="Search regions, temperatures, or risk levels..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-blue-50/20 border border-blue-400/30 rounded-lg sm:rounded-xl text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <span>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
            className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                      {column.icon && <column.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="truncate">{column.label}</span>
                      <span className="transform transition-transform group-hover:scale-110 flex-shrink-0">
                        {getSortIcon(column.key)}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                      {column.icon && <column.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="truncate">{column.label}</span>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedData.map((item) => {
              const isSelected = selectedPoint && 
                item.lat === selectedPoint.lat && 
                item.lon === selectedPoint.lon &&
                item.lead === selectedPoint.lead;

              return (
                <tr
                  key={`${item.lat}-${item.lon}-${item.lead}`}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 shadow-lg' : ''
                  }`}
                >
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.region_name || 'Unknown Region'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          {item.lat?.toFixed(2)}, {item.lon?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                      {item.region_id || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold border ${getTemperatureColor(item.tmax_pred)}`}>
                      <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{formatTemperature(item.tmax_pred)}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold border ${getRiskColor(item.hw_prob)}`}>
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{formatProbability(item.hw_prob)}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-bold border ${
                      item.hw_pred && item.hw_pred !== 'None' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                    }`}>
                      <span className="truncate">{item.hw_pred || 'None'}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-200">{item.lead}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">Day {item.lead}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium truncate">
                        {formatDate(item.forecast_date)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
