import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatTemperature, formatProbability, formatDate } from '../utils/formatters';

const DataTable = ({ data, onRowClick, selectedPoint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredAndSortedData = useMemo(() => {
    let filtered = data || [];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.region_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.region_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.hw_pred || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  const columns = [
    { key: 'region_name', label: 'Region', sortable: true },
    { key: 'region_id', label: 'ID', sortable: true },
    { key: 'tmax_pred', label: 'Temp (°C)', sortable: true },
    { key: 'hw_prob', label: 'HW Risk', sortable: true },
    { key: 'hw_pred', label: 'HW Class', sortable: true },
    { key: 'lead', label: 'Lead', sortable: true },
    { key: 'forecast_date', label: 'Forecast Date', sortable: true }
  ];

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">No forecast data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Forecast Data Table</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.slice(0, 50).map((item, index) => {
              const isSelected = selectedPoint && 
                item.lat === selectedPoint.lat && 
                item.lon === selectedPoint.lon &&
                item.lead === selectedPoint.lead;

              return (
                <tr
                  key={index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {item.region_name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.region_id || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${
                      item.tmax_pred > 35 ? 'text-red-600' : 
                      item.tmax_pred > 30 ? 'text-orange-600' : 
                      'text-gray-900'
                    }`}>
                      {formatTemperature(item.tmax_pred)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${
                      item.hw_prob > 0.6 ? 'text-red-600' : 
                      item.hw_prob > 0.3 ? 'text-orange-600' : 
                      'text-gray-900'
                    }`}>
                      {formatProbability(item.hw_prob)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.hw_pred && item.hw_pred !== 'None' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.hw_pred || 'None'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    Day {item.lead}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(item.forecast_date)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedData.length > 50 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing first 50 of {filteredAndSortedData.length} results
        </div>
      )}
    </div>
  );
};

export default DataTable;
