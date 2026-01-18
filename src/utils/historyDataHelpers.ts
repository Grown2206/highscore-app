/**
 * **FIX v8.8**: Helper functions for historyData aggregations
 * Single source of truth for all hit count calculations
 */

export interface HistoryDataEntry {
  date: string; // YYYY-MM-DD format
  count: number;
  strainId?: number | null;
  note?: string;
}

/**
 * **FIX v8.8.1**: Format date as local YYYY-MM-DD (no UTC shift)
 * @param date - JavaScript Date object
 * @returns Date in YYYY-MM-DD format (local timezone)
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate total hits from historyData
 * @param historyData - Array of history entries
 * @returns Total hit count
 */
export const getTotalHits = (historyData: HistoryDataEntry[]): number => {
  if (!Array.isArray(historyData)) return 0;
  return historyData.reduce((sum, day) => sum + day.count, 0);
};

/**
 * Calculate average hits per active day
 * @param historyData - Array of history entries
 * @returns Average hits per day
 */
export const getAvgHitsPerDay = (historyData: HistoryDataEntry[]): number => {
  if (!Array.isArray(historyData)) return 0;
  const activeDays = historyData.filter(d => d.count > 0).length;
  if (activeDays === 0) return 0;
  const totalHits = getTotalHits(historyData);
  return totalHits / activeDays;
};

/**
 * Get hit count for a specific date
 * @param historyData - Array of history entries
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Hit count for that date
 */
export const getHitsForDate = (historyData: HistoryDataEntry[], dateStr: string): number => {
  if (!Array.isArray(historyData)) return 0;
  const dayData = historyData.find(d => d.date === dateStr);
  return dayData ? dayData.count : 0;
};

/**
 * **FIX v8.8.1**: Get hits for date range using LOCAL time (no UTC shift)
 * @param historyData - Array of history entries
 * @param days - Number of days to look back
 * @returns Array of {date, count} for the range
 */
export const getLastNDays = (historyData: HistoryDataEntry[], days: number): HistoryDataEntry[] => {
  if (!Array.isArray(historyData)) return [];
  const today = new Date();
  const result: HistoryDataEntry[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatLocalDate(date); // FIX: Use local date formatting
    const count = getHitsForDate(historyData, dateStr);
    result.push({ date: dateStr, count });
  }

  return result;
};
