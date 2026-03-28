import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Thermometer, AlertTriangle, BarChart3, PieChartIcon, MapPin } from 'lucide-react';

// Move tooltip components outside of render
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-95">
        <p className="text-sm font-bold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-sm text-slate-600 font-medium">{entry.name}:</span>
            <span className="text-sm font-bold text-slate-900">
              {entry.name.includes('Temp') ? `${entry.value}°C` : `${entry.value}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, dataLength }) => {
  if (active && payload && payload.length) {
    const percentage = Math.round((payload[0].value / dataLength) * 100);
    return (
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-95">
        <p className="text-sm font-bold text-slate-900 mb-2">{payload[0].name}</p>
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-sm text-slate-600 font-medium">Count:</span>
          <span className="text-sm font-bold text-slate-900">{payload[0].value}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-600 font-medium">Percentage:</span>
          <span className="text-sm font-bold text-slate-900">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-600">Loading your weather forecast analytics...</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="h-80 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
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

  // Calculate summary statistics
  const totalRegions = Object.keys(regionData).length;
  const avgTempOverall = Math.round(data.reduce((sum, item) => sum + (item.tmax_pred || 0), 0) / data.length);
  const highRiskRegions = Object.values(regionData).filter(r => r.avgHeatwaveProb > 40).length;
  const currentSeason = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Comprehensive weather forecast analysis for {currentSeason}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium">Total Regions</p>
                <p className="text-2xl font-bold text-slate-900">{totalRegions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Thermometer className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium">Avg Temperature</p>
                <p className="text-2xl font-bold text-slate-900">{avgTempOverall}°C</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium">High Risk Areas</p>
                <p className="text-2xl font-bold text-slate-900">{highRiskRegions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium">Data Points</p>
                <p className="text-2xl font-bold text-slate-900">{data.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature by Region Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Top 10 Regions by Temperature
                </h3>
                <p className="text-sm text-slate-600 mt-1">Highest average temperatures across regions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={regionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="region" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={{ stroke: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgTemp" fill="#f97316" name="Avg Temperature" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Temperature Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  Temperature Distribution
                </h3>
                <p className="text-sm text-slate-600 mt-1">Breakdown of temperature ranges across all regions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={tempRanges.filter(r => r.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count, percent }) => `${range}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {tempRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip dataLength={data.length} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Heatwave Risk Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Heatwave Risk Distribution
                </h3>
                <p className="text-sm text-slate-600 mt-1">Risk levels across all monitored regions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={heatwaveRiskData.filter(r => r.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ risk, count, percent }) => `${risk.split('(')[0].trim()}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={200}
                  animationDuration={800}
                >
                  {heatwaveRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip dataLength={data.length} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Heatwave Risk by Region */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Top 10 Regions by Heatwave Risk
                </h3>
                <p className="text-sm text-slate-600 mt-1">Regions with highest heatwave probability</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={regionChartData.sort((a, b) => b.avgHeatwaveProb - a.avgHeatwaveProb).slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="region" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={{ stroke: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgHeatwaveProb" fill="#ef4444" name="Avg Heatwave Prob" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Last updated: {new Date().toLocaleString()} | Data points: {data.length} regions</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
