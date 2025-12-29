/**
 * **FIX v8.8**: Helper functions for historyData aggregations
 * Single source of truth for all hit count calculations
 */

/**
 * Calculate total hits from historyData
 * @param {Array} historyData - Array of {date, count} objects
 * @returns {number} Total hit count
 */
export const getTotalHits = (historyData) => {
  if (!Array.isArray(historyData)) return 0;
  return historyData.reduce((sum, day) => sum + day.count, 0);
};

/**
 * Calculate average hits per active day
 * @param {Array} historyData - Array of {date, count} objects
 * @returns {number} Average hits per day
 */
export const getAvgHitsPerDay = (historyData) => {
  if (!Array.isArray(historyData)) return 0;
  const activeDays = historyData.filter(d => d.count > 0).length;
  if (activeDays === 0) return 0;
  const totalHits = getTotalHits(historyData);
  return totalHits / activeDays;
};

/**
 * Get hit count for a specific date
 * @param {Array} historyData - Array of {date, count} objects
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {number} Hit count for that date
 */
export const getHitsForDate = (historyData, dateStr) => {
  if (!Array.isArray(historyData)) return 0;
  const dayData = historyData.find(d => d.date === dateStr);
  return dayData ? dayData.count : 0;
};

/**
 * Get hits for date range
 * @param {Array} historyData - Array of {date, count} objects
 * @param {number} days - Number of days to look back
 * @returns {Array} Array of {date, count} for the range
 */
export const getLastNDays = (historyData, days) => {
  if (!Array.isArray(historyData)) return [];
  const today = new Date();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = getHitsForDate(historyData, dateStr);
    result.push({ date: dateStr, count });
  }

  return result;
};
