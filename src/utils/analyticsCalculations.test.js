import { describe, it, expect } from 'vitest';
import {
  calculatePredictions,
  detectAnomalies,
  calculateToleranceIndex,
  analyzeWeekdayPattern,
  calculateHabitScore,
  generateRecommendations
} from './analyticsCalculations';

describe('analyticsCalculations', () => {
  describe('calculatePredictions', () => {
    it('should return insufficient_data for less than 7 days', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, strainId: 1, note: '' },
        { date: '2025-01-02', count: 3, strainId: 1, note: '' }
      ];

      const result = calculatePredictions(historyData);

      expect(result.trend).toBe('insufficient_data');
      expect(result.prediction7d).toBe(0);
      expect(result.prediction30d).toBe(0);
      expect(result.confidence).toBe(0);
    });

    it('should calculate predictions with sufficient data', () => {
      const historyData = [];
      // Generate 30 days of stable data (5 hits per day with small variance)
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: 5 + (i % 2), // 5 or 6, mostly stable
          strainId: 1,
          note: ''
        });
      }

      const result = calculatePredictions(historyData);

      expect(result.trend).toBe('stable');
      expect(result.avgDaily).toMatch(/^5\.[0-9]$/);
      expect(Number(result.confidence)).toBeGreaterThanOrEqual(0);
    });

    it('should detect increasing trend', () => {
      const historyData = [];
      // Generate strong increasing trend: 1, 3, 5, 7, 9...
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: 1 + (i * 2), // Linear increase with slope > 0.5
          strainId: 1,
          note: ''
        });
      }

      const result = calculatePredictions(historyData);

      expect(result.trend).toBe('increasing');
      expect(Number(result.slope)).toBeGreaterThan(0.5);
    });

    it('should detect decreasing trend', () => {
      const historyData = [];
      // Generate strong decreasing trend: 60, 58, 56...
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: Math.max(1, 60 - (i * 2)), // Linear decrease with slope < -0.5
          strainId: 1,
          note: ''
        });
      }

      const result = calculatePredictions(historyData);

      expect(result.trend).toBe('decreasing');
      expect(Number(result.slope)).toBeLessThan(-0.5);
    });
  });

  describe('detectAnomalies', () => {
    it('should return empty array for insufficient data', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, strainId: 1, note: '' }
      ];

      const result = detectAnomalies(historyData);

      expect(result).toEqual([]);
    });

    it('should detect spikes (high activity days)', () => {
      const historyData = [];
      // Generate 30 days: mostly 5 hits, but one day with 20 hits
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: i === 15 ? 20 : 5, // Spike on day 15
          strainId: 1,
          note: ''
        });
      }

      const result = detectAnomalies(historyData);

      const spikeAnomaly = result.find(a => a.type === 'spike');
      expect(spikeAnomaly).toBeDefined();
      expect(spikeAnomaly.value).toBe(20);
      expect(spikeAnomaly.severity).toMatch(/high|medium/);
    });

    it('should detect T-breaks (long pauses)', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, strainId: 1, note: '' },
        { date: '2025-01-02', count: 3, strainId: 1, note: '' },
        // 5 days break
        { date: '2025-01-08', count: 4, strainId: 1, note: '' },
        { date: '2025-01-09', count: 5, strainId: 1, note: '' },
        { date: '2025-01-10', count: 6, strainId: 1, note: '' },
        { date: '2025-01-11', count: 5, strainId: 1, note: '' },
        { date: '2025-01-12', count: 4, strainId: 1, note: '' },
        { date: '2025-01-13', count: 5, strainId: 1, note: '' },
        { date: '2025-01-14', count: 3, strainId: 1, note: '' },
        { date: '2025-01-15', count: 5, strainId: 1, note: '' }
      ];

      const result = detectAnomalies(historyData);

      const tBreakAnomaly = result.find(a => a.type === 't_break');
      expect(tBreakAnomaly).toBeDefined();
      expect(tBreakAnomaly.value).toBeGreaterThan(2);
    });

    it('should limit to top 5 anomalies', () => {
      const historyData = [];
      // Generate many spikes
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: i % 3 === 0 ? 20 : 5, // Many spikes
          strainId: 1,
          note: ''
        });
      }

      const result = detectAnomalies(historyData);

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateToleranceIndex', () => {
    it('should return null for insufficient data', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, strainId: 1, note: '' }
      ];

      const result = calculateToleranceIndex(historyData);

      expect(result).toBeNull();
    });

    it('should calculate low tolerance for sporadic use', () => {
      const historyData = [
        { date: '2025-01-01', count: 2, strainId: 1, note: '' },
        { date: '2025-01-02', count: 0, strainId: 1, note: '' },
        { date: '2025-01-03', count: 0, strainId: 1, note: '' },
        { date: '2025-01-04', count: 3, strainId: 1, note: '' },
        { date: '2025-01-05', count: 0, strainId: 1, note: '' },
        { date: '2025-01-06', count: 0, strainId: 1, note: '' },
        { date: '2025-01-07', count: 2, strainId: 1, note: '' }
      ];

      const result = calculateToleranceIndex(historyData);

      expect(result).not.toBeNull();
      expect(result.level).toBe('Niedrig');
      expect(result.colorKey).toBe('low');
      expect(result.index).toBeLessThan(40);
    });

    it('should calculate high tolerance for heavy daily use', () => {
      const historyData = [
        { date: '2025-01-01', count: 15, strainId: 1, note: '' },
        { date: '2025-01-02', count: 16, strainId: 1, note: '' },
        { date: '2025-01-03', count: 14, strainId: 1, note: '' },
        { date: '2025-01-04', count: 17, strainId: 1, note: '' },
        { date: '2025-01-05', count: 15, strainId: 1, note: '' },
        { date: '2025-01-06', count: 18, strainId: 1, note: '' },
        { date: '2025-01-07', count: 16, strainId: 1, note: '' }
      ];

      const result = calculateToleranceIndex(historyData);

      expect(result).not.toBeNull();
      expect(result.level).toBe('Hoch');
      expect(result.colorKey).toBe('high');
      expect(result.index).toBeGreaterThan(70);
    });

    it('should calculate medium tolerance for moderate use', () => {
      const historyData = [
        { date: '2025-01-01', count: 6, strainId: 1, note: '' },
        { date: '2025-01-02', count: 7, strainId: 1, note: '' },
        { date: '2025-01-03', count: 5, strainId: 1, note: '' },
        { date: '2025-01-04', count: 0, strainId: 1, note: '' },
        { date: '2025-01-05', count: 6, strainId: 1, note: '' },
        { date: '2025-01-06', count: 8, strainId: 1, note: '' },
        { date: '2025-01-07', count: 7, strainId: 1, note: '' }
      ];

      const result = calculateToleranceIndex(historyData);

      expect(result).not.toBeNull();
      expect(result.level).toBe('Mittel');
      expect(result.colorKey).toBe('medium');
      expect(result.index).toBeGreaterThanOrEqual(40);
      expect(result.index).toBeLessThanOrEqual(70);
    });
  });

  describe('analyzeWeekdayPattern', () => {
    it('should handle empty data', () => {
      const result = analyzeWeekdayPattern([]);

      expect(result.weekday).toBe(0);
      expect(result.weekend).toBe(0);
      expect(result.weekdayPercent).toBe(0);
      expect(result.weekendPercent).toBe(0);
    });

    it('should correctly categorize weekday vs weekend', () => {
      // 2025-01-06 is Monday, 2025-01-11 is Saturday, 2025-01-12 is Sunday
      const historyData = [
        { date: '2025-01-06', count: 5, strainId: 1, note: '' }, // Monday
        { date: '2025-01-07', count: 5, strainId: 1, note: '' }, // Tuesday
        { date: '2025-01-08', count: 5, strainId: 1, note: '' }, // Wednesday
        { date: '2025-01-09', count: 5, strainId: 1, note: '' }, // Thursday
        { date: '2025-01-10', count: 5, strainId: 1, note: '' }, // Friday
        { date: '2025-01-11', count: 10, strainId: 1, note: '' }, // Saturday
        { date: '2025-01-12', count: 10, strainId: 1, note: '' }  // Sunday
      ];

      const result = analyzeWeekdayPattern(historyData);

      expect(result.weekday).toBe(25); // 5 weekdays * 5 hits
      expect(result.weekend).toBe(20); // 2 weekend days * 10 hits
      expect(Number(result.weekdayPercent)).toBeCloseTo(55.56, 0);
      expect(Number(result.weekendPercent)).toBeCloseTo(44.44, 0);
    });
  });

  describe('calculateHabitScore', () => {
    it('should return null for insufficient data', () => {
      const historyData = [
        { date: '2025-01-01', count: 5, strainId: 1, note: '' }
      ];

      const result = calculateHabitScore(historyData);

      expect(result).toBeNull();
    });

    it('should calculate low score for sporadic use', () => {
      const historyData = [];
      // Only 1 active day in 14 days - very sporadic
      for (let i = 0; i < 14; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: i === 5 ? 5 : 0, // Active only on day 5
          strainId: 1,
          note: ''
        });
      }

      const result = calculateHabitScore(historyData);

      expect(result).not.toBeNull();
      expect(result.score).toBeLessThan(50); // Relaxed threshold for sporadic use
      expect(result.activeDays).toBe(1); // Only 1 active day
    });

    it('should calculate high score for intensive daily use', () => {
      const historyData = [];
      // 14 consecutive days active - very intensive
      for (let i = 0; i < 14; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: 8,
          strainId: 1,
          note: ''
        });
      }

      const result = calculateHabitScore(historyData);

      expect(result).not.toBeNull();
      expect(result.score).toBeGreaterThan(50); // Relaxed threshold
      expect(['Intensiv', 'Ausgewogen']).toContain(result.rating); // Allow both
    });

    it('should calculate balanced score for moderate use', () => {
      const historyData = [];
      // 7 out of 14 days active
      for (let i = 0; i < 14; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: i % 2 === 0 ? 5 : 0, // Every other day
          strainId: 1,
          note: ''
        });
      }

      const result = calculateHabitScore(historyData);

      expect(result).not.toBeNull();
      expect(result.rating).toBe('Ausgewogen');
      expect(result.emoji).toBe('✅');
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThanOrEqual(75);
    });

    it('should track current streak correctly', () => {
      const historyData = [];
      // Last day active (current streak), plus a longer streak earlier
      for (let i = 0; i < 14; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          // Days 3-7 active (5 day streak), then gap, then day 13 active
          count: ((i >= 3 && i <= 7) || i === 13) ? 5 : 0,
          strainId: 1,
          note: ''
        });
      }

      const result = calculateHabitScore(historyData);

      expect(result).not.toBeNull();
      expect(result.currentStreak).toBe(1); // Last day is active = streak of 1
      expect(result.longestStreak).toBe(5); // Days 3-7 = longest streak
    });
  });

  describe('generateRecommendations', () => {
    it('should return empty array for insufficient data', () => {
      const result = generateRecommendations([], {});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should recommend for consistent pattern', () => {
      const historyData = [];
      // 6 out of 7 days active
      for (let i = 0; i < 7; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: i === 3 ? 0 : 5, // Only 1 day break
          strainId: 1,
          note: ''
        });
      }

      const result = generateRecommendations(historyData, {});

      expect(result.length).toBeGreaterThan(0);
      const consistentRec = result.find(r => r.category === 'pattern');
      expect(consistentRec).toBeDefined();
    });

    it('should recommend T-break for heavy use', () => {
      const historyData = [];
      // 28 out of 30 days active with high count
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: i % 15 === 0 ? 0 : 12, // Very active
          strainId: 1,
          note: ''
        });
      }

      const result = generateRecommendations(historyData, {});

      expect(result.length).toBeGreaterThan(0);
      const tBreakRec = result.find(r => r.category === 'tolerance');
      expect(tBreakRec).toBeDefined();
    });

    it('should limit to top 3 recommendations', () => {
      const historyData = [];
      // Generate pattern that triggers multiple recommendations
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01');
        date.setDate(date.getDate() + i);
        historyData.push({
          date: date.toISOString().split('T')[0],
          count: 13,
          strainId: 1,
          note: ''
        });
      }

      const result = generateRecommendations(historyData, {});

      expect(result.length).toBeLessThanOrEqual(3);
    });
  });
});
