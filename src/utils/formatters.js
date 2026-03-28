export const formatTemperature = (temp) => {
  if (temp === null || temp === undefined) return 'N/A';
  return `${Math.round(temp)}°C`;
};

export const formatProbability = (prob) => {
  if (prob === null || prob === undefined) return 'N/A';
  return `${Math.round(prob * 100)}%`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getHeatwaveClass = (hwPred) => {
  if (!hwPred) return 'None';
  return hwPred;
};

export const getTemperatureColor = (temp) => {
  if (temp === null || temp === undefined) return '#94a3b8';
  
  if (temp < 20) return '#3b82f6';
  if (temp < 25) return '#10b981';
  if (temp < 30) return '#f59e0b';
  if (temp < 35) return '#f97316';
  if (temp < 40) return '#ef4444';
  return '#dc2626';
};

export const getHeatwaveColor = (hwProb) => {
  if (hwProb === null || hwProb === undefined) return '#94a3b8';
  
  if (hwProb < 0.2) return '#10b981';
  if (hwProb < 0.4) return '#f59e0b';
  if (hwProb < 0.6) return '#f97316';
  if (hwProb < 0.8) return '#ef4444';
  return '#dc2626';
};
