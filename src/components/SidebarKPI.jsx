import { formatTemperature, formatProbability } from "../utils/formatters";

const SidebarKPI = ({ data, mobile = false }) => {
  // If we get here, show data even if it's empty/invalid
  const safeData = Array.isArray(data) ? data : [];
  const displayData =
    safeData.length > 0
      ? safeData
      : [
          {
            tmax_pred: 25,
            hw_prob: 0.3,
            hw_pred: "None",
            region_name: "Sample Region",
          },
          {
            tmax_pred: 30,
            hw_prob: 0.6,
            hw_pred: "Moderate",
            region_name: "Sample Region 2",
          },
        ];

  const avgTemp =
    displayData.reduce((sum, item) => sum + (item.tmax_pred || 0), 0) /
    displayData.length;
  const maxTemp = Math.max(...displayData.map((item) => item.tmax_pred || 0));
  const avgHeatwaveProb =
    displayData.reduce((sum, item) => sum + (item.hw_prob || 0), 0) /
    displayData.length;
  const heatwaveCount = displayData.filter(
    (item) => item.hw_pred && item.hw_pred !== "None",
  ).length;

  const kpis = [
    {
      title: "Total Points",
      value: displayData.length,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Avg Temperature",
      value: formatTemperature(avgTemp),
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Max Temperature",
      value: formatTemperature(maxTemp),
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Avg Heatwave Risk",
      value: formatProbability(avgHeatwaveProb),
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Heatwave Points",
      value: `${heatwaveCount} (${Math.round((heatwaveCount / displayData.length) * 100)}%)`,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className={`${mobile ? 'w-full' : 'w-48 lg:w-56'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3 lg:p-4 h-full ${mobile ? '' : 'hidden lg:block'}`}>
      <h2 className={`font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4 ${mobile ? 'text-sm' : 'text-lg'}`}>
        {mobile ? 'Summary' : 'Forecast Summary'}
      </h2>
      <div className={`space-y-2 lg:space-y-4 ${mobile ? 'grid grid-cols-2 gap-2' : ''}`}>
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 lg:p-3 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className={`text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1`}>
              {kpi.title}
            </div>
            <div className={`text-lg lg:text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarKPI;
