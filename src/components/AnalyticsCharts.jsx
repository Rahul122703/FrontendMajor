import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatTemperature, formatProbability } from '../utils/formatters';

const AnalyticsCharts = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const regionData = data.reduce((acc, item) => {
    const region = item.region_name || 'Unknown';
    if (!acc[region]) {
      acc[region] = {
        region,
        count: 0,
        avgTemp: 0,
        avgHeatwaveProb: 0,
        heatwaveCount: 0
      };
    }
    acc[region].count++;
    acc[region].avgTemp += item.tmax_pred || 0;
    acc[region].avgHeatwaveProb += item.hw_prob || 0;
    if (item.hw_pred && item.hw_pred !== 'None') {
      acc[region].heatwaveCount++;
    }
    return acc;
  }, {});

  const regionChartData = Object.values(regionData)
    .map(item => ({
      ...item,
      avgTemp: Math.round(item.avgTemp / item.count),
      avgHeatwaveProb: Math.round((item.avgHeatwaveProb / item.count) * 100)
    }))
    .sort((a, b) => b.avgTemp - a.avgTemp)
    .slice(0, 10);

  const tempRanges = [
    { range: '< 20°C', min: -Infinity, max: 20, count: 0, color: '#3b82f6' },
    { range: '20-25°C', min: 20, max: 25, count: 0, color: '#10b981' },
    { range: '25-30°C', min: 25, max: 30, count: 0, color: '#f59e0b' },
    { range: '30-35°C', min: 30, max: 35, count: 0, color: '#f97316' },
    { range: '35-40°C', min: 35, max: 40, count: 0, color: '#ef4444' },
    { range: '> 40°C', min: 40, max: Infinity, count: 0, color: '#dc2626' }
  ];

  data.forEach(item => {
    const temp = item.tmax_pred;
    if (temp !== null && temp !== undefined) {
      const range = tempRanges.find(r => temp >= r.min && temp < r.max);
      if (range) range.count++;
    }
  });

  const heatwaveRiskData = [
    { risk: 'Low (0-20%)', count: 0, color: '#10b981' },
    { risk: 'Medium (20-40%)', count: 0, color: '#f59e0b' },
    { risk: 'High (40-60%)', count: 0, color: '#f97316' },
    { risk: 'Very High (60-80%)', count: 0, color: '#ef4444' },
    { risk: 'Extreme (80-100%)', count: 0, color: '#dc2626' }
  ];

  data.forEach(item => {
    const prob = item.hw_prob;
    if (prob !== null && prob !== undefined) {
      if (prob < 0.2) heatwaveRiskData[0].count++;
      else if (prob < 0.4) heatwaveRiskData[1].count++;
      else if (prob < 0.6) heatwaveRiskData[2].count++;
      else if (prob < 0.8) heatwaveRiskData[3].count++;
      else heatwaveRiskData[4].count++;
    }
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}: {entry.name.includes('Temp') ? `${entry.value}°C` : `${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
          <p className="text-sm text-gray-600">Percentage: {Math.round((payload[0].value / data.length) * 100)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Regions by Temperature</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="region" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgTemp" fill="#f97316" name="Avg Temperature" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tempRanges.filter(r => r.count > 0)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ range, count }) => `${range}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {tempRanges.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Heatwave Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={heatwaveRiskData.filter(r => r.count > 0)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ risk, count }) => `${risk}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {heatwaveRiskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Regions by Heatwave Risk</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionChartData.sort((a, b) => b.avgHeatwaveProb - a.avgHeatwaveProb).slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="region" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgHeatwaveProb" fill="#ef4444" name="Avg Heatwave Prob" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
