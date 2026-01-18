import { describe, it, expect } from 'vitest';
import {
  formatLocalDate,
  getTotalHits,
  getAvgHitsPerDay,
  getHitsForDate,
  getLastNDays
} from './historyDataHelpers';

describe('historyDataHelpers', () => {
  describe('formatLocalDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2025-01-15T10:30:00');
      const result = formatLocalDate(date);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toBe('2025-01-15');
    });

    it('should handle different months', () => {
      const date = new Date('2025-12-31T23:59:59');
      const result = formatLocalDate(date);

      expect(result).toBe('2025-12-31');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2025-03-05T00:00:00');
      const result = formatLocalDate(date);

      expect(result).toBe('2025-03-05');
    });
  });

  describe('getTotalHits', () => {
    it('should return 0 for empty array', () => {
      const result = getTotalHits([]);

      expect(result).toBe(0);
    });

    it('should sum all hits correctly', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, note: '' },
        { date: '2025-01-02', count: 3, note: '' },
        { date: '2025-01-03', count: 7, note: '' }
      ];

      const result = getTotalHits(historyData);

      expect(result).toBe(15);
    });

    it('should handle zero counts', () => {
      const historyData = [
        { date: '2025-01-01', count: 0, note: '' },
        { date: '2025-01-02', count: 5, note: '' },
        { date: '2025-01-03', count: 0, note: '' }
      ];

      const result = getTotalHits(historyData);

      expect(result).toBe(5);
    });

    it('should handle large numbers', () => {
      const historyData = [
        { date: '2025-01-01', count: 1000, note: '' },
        { date: '2025-01-02', count: 500, note: '' },
        { date: '2025-01-03', count: 750, note: '' }
      ];

      const result = getTotalHits(historyData);

      expect(result).toBe(2250);
    });
  });

  describe('getAvgHitsPerDay', () => {
    it('should return 0 for empty array', () => {
      const result = getAvgHitsPerDay([]);

      expect(result).toBe(0);
    });

    it('should calculate average correctly', () => {
      const historyData = [
        { date: '2025-01-01', count: 6, note: '' },
        { date: '2025-01-02', count: 3, note: '' },
        { date: '2025-01-03', count: 9, note: '' }
      ];

      const result = getAvgHitsPerDay(historyData);

      expect(result).toBe(6); // (6 + 3 + 9) / 3
    });

    it('should only count days with hits > 0', () => {
      const historyData = [
        { date: '2025-01-01', count: 10, note: '' },
        { date: '2025-01-02', count: 0, note: '' },
        { date: '2025-01-03', count: 0, note: '' },
        { date: '2025-01-04', count: 20, note: '' }
      ];

      const result = getAvgHitsPerDay(historyData);

      expect(result).toBe(15); // (10 + 20) / 2 active days
    });

    it('should return 0 if no active days', () => {
      const historyData = [
        { date: '2025-01-01', count: 0, note: '' },
        { date: '2025-01-02', count: 0, note: '' },
        { date: '2025-01-03', count: 0, note: '' }
      ];

      const result = getAvgHitsPerDay(historyData);

      expect(result).toBe(0);
    });

    it('should handle decimal averages correctly', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, note: '' },
        { date: '2025-01-02', count: 4, note: '' },
        { date: '2025-01-03', count: 6, note: '' }
      ];

      const result = getAvgHitsPerDay(historyData);

      expect(result).toBe(5); // (5 + 4 + 6) / 3 = 5
    });
  });

  describe('getHitsForDate', () => {
    it('should return 0 for empty array', () => {
      const result = getHitsForDate([], '2025-01-01');

      expect(result).toBe(0);
    });

    it('should return correct count for existing date', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, note: '' },
        { date: '2025-01-02', count: 3, note: '' },
        { date: '2025-01-03', count: 7, note: '' }
      ];

      const result = getHitsForDate(historyData, '2025-01-02');

      expect(result).toBe(3);
    });

    it('should return 0 for non-existing date', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, note: '' },
        { date: '2025-01-02', count: 3, note: '' }
      ];

      const result = getHitsForDate(historyData, '2025-01-05');

      expect(result).toBe(0);
    });

    it('should handle date with zero count', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, note: '' },
        { date: '2025-01-02', count: 0, note: '' }
      ];

      const result = getHitsForDate(historyData, '2025-01-02');

      expect(result).toBe(0);
    });
  });

  describe('getLastNDays', () => {
    it('should generate array with N days from today', () => {
      const result = getLastNDays([], 7);

      expect(result).toHaveLength(7);
      // Each entry should have date and count properties
      result.forEach(entry => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('count');
        expect(entry.count).toBe(0); // No data = 0 count
      });
    });

    it('should return counts for matching dates', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatLocalDate(yesterday);

      const historyData = [
        { date: yesterdayStr, count: 5, note: '' }
      ];

      const result = getLastNDays(historyData, 2);

      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(5); // Yesterday
      expect(result[1].count).toBe(0); // Today (no data)
    });

    it('should return 0 counts for dates not in historyData', () => {
      const historyData = [
        { date: '2020-01-01', count: 100, note: '' } // Old date, not in last N days
      ];

      const result = getLastNDays(historyData, 3);

      expect(result).toHaveLength(3);
      result.forEach(entry => {
        expect(entry.count).toBe(0);
      });
    });

    it('should handle N = 0', () => {
      const historyData = [
        { date: '2025-01-01', count: 1, note: '' },
        { date: '2025-01-02', count: 2, note: '' }
      ];

      const result = getLastNDays(historyData, 0);

      expect(result).toEqual([]);
    });

    it('should use local date formatting', () => {
      const result = getLastNDays([], 1);

      expect(result).toHaveLength(1);
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
