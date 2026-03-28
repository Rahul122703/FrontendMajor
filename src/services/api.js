const API_BASE_URL = "https://sharebro.onrender.com/api/forecast";

export const fetchForecastData = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response:", data);

    // Handle different response formats
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.error("Unexpected API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    throw error;
  }
};

export const getSeason = (date) => {
  const inputDate = new Date(date);
  // Subtract 2 months from the input date
  const adjustedDate = new Date(inputDate);
  const adjustedMonth = adjustedDate.getMonth() - 2;
  
  // Handle month wrap-around (e.g., January - 2 = November of previous year)
  if (adjustedMonth < 0) {
    adjustedDate.setMonth(adjustedMonth + 12);
    adjustedDate.setFullYear(adjustedDate.getFullYear() - 1);
  } else {
    adjustedDate.setMonth(adjustedMonth);
  }
  
  const month = adjustedDate.getMonth() + 1;
  console.log("Original month:", inputDate.getMonth() + 1);
  console.log("Adjusted month (2 months back):", month);
  
  if ([12, 1, 2].includes(month)) return "Winter";
  if ([3, 4, 5].includes(month)) return "Pre-monsoon";
  if ([6, 7, 8, 9].includes(month)) return "Monsoon";
  if ([10, 11].includes(month)) return "Post-monsoon";

  return "Unknown";
};

export const getCurrentSeason = () => {
  return getSeason(new Date());
};
