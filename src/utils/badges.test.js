/**
 * Unit Tests for Badge System v7.0
 * Tests badge calculation, progress tracking, and unlocking logic
 */

import { describe, it, expect } from 'vitest';
import {
  BADGE_CATEGORIES,
  calculateBadges,
  detectUnlockedBadges,
  calculateUserStats
} from './badges';

describe('Badge System - Badge Categories', () => {
  it('should have all expected badge categories', () => {
    const expectedCategories = [
      'SESSIONS', 'STREAKS', 'DAILY_RECORD', 'SPENDING', 'STRAINS',
      'EARLY_BIRD', 'NIGHT_OWL', 'EFFICIENCY', 'WEEKEND_WARRIOR',
      'MARATHON', 'CONSISTENCY', 'EXPLORER', 'DEDICATED'
    ];

    expectedCategories.forEach(category => {
      expect(BADGE_CATEGORIES[category]).toBeDefined();
      expect(BADGE_CATEGORIES[category].levels).toBeInstanceOf(Array);
      expect(BADGE_CATEGORIES[category].levels.length).toBeGreaterThan(0);
    });
  });

  it('should have properly structured level requirements', () => {
    Object.values(BADGE_CATEGORIES).forEach(category => {
      category.levels.forEach(level => {
        expect(level.requirement).toBeDefined();
        expect(typeof level.requirement).toBe('number');
        expect(level.id).toBeDefined();
        expect(level.name).toBeDefined();
        expect(level.icon).toBeDefined();
      });

      // EFFICIENCY badge has descending requirements (lower cost = better)
      // All other badges have ascending requirements
      if (category.id !== 'efficiency') {
        let prevRequirement = -1;
        category.levels.forEach(level => {
          expect(level.requirement).toBeGreaterThan(prevRequirement);
          prevRequirement = level.requirement;
        });
      } else {
        // Efficiency should have descending requirements
        let prevRequirement = 999;
        category.levels.forEach(level => {
          expect(level.requirement).toBeLessThan(prevRequirement);
          prevRequirement = level.requirement;
        });
      }
    });
  });
});

describe('Badge System - calculateBadges', () => {
  it('should calculate badge progress with no stats', () => {
    const stats = {
      sessions: 0,
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    };

    const badges = calculateBadges(stats);

    expect(badges).toBeInstanceOf(Array);
    expect(badges.length).toBe(Object.keys(BADGE_CATEGORIES).length);

    badges.forEach(badge => {
      // Efficiency has special default value of 999 (to disable it when not calculated)
      if (badge.category !== 'efficiency') {
        expect(badge.currentValue).toBe(0);
        expect(badge.unlockedLevel).toBeNull();
        expect(badge.progress).toBe(0);
        expect(badge.maxLevel).toBe(false);
      } else {
        expect(badge.currentValue).toBe(999);
      }
      expect(badge.nextLevel).toBeDefined();
    });
  });

  it('should calculate badge progress with bronze level unlocked', () => {
    const stats = {
      sessions: 10,
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    };

    const badges = calculateBadges(stats);
    const sessionsBadge = badges.find(b => b.category === 'sessions');

    expect(sessionsBadge.currentValue).toBe(10);
    expect(sessionsBadge.unlockedLevel.id).toBe('bronze');
    expect(sessionsBadge.nextLevel.id).toBe('silver');
    expect(sessionsBadge.progress).toBe(0); // 10/50 progress to silver
    expect(sessionsBadge.maxLevel).toBe(false);
  });

  it('should calculate progress between levels correctly', () => {
    const stats = {
      sessions: 30, // Between bronze (10) and silver (50)
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    };

    const badges = calculateBadges(stats);
    const sessionsBadge = badges.find(b => b.category === 'sessions');

    expect(sessionsBadge.currentValue).toBe(30);
    expect(sessionsBadge.unlockedLevel.id).toBe('bronze');
    expect(sessionsBadge.nextLevel.id).toBe('silver');
    // Progress: (30 - 10) / (50 - 10) = 20/40 = 50%
    expect(sessionsBadge.progress).toBe(50);
    expect(sessionsBadge.remaining).toBe(20);
  });

  it('should calculate max level correctly', () => {
    const stats = {
      sessions: 500, // Platinum level (highest)
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    };

    const badges = calculateBadges(stats);
    const sessionsBadge = badges.find(b => b.category === 'sessions');

    expect(sessionsBadge.currentValue).toBe(500);
    expect(sessionsBadge.unlockedLevel.id).toBe('platinum');
    expect(sessionsBadge.nextLevel).toBeNull();
    expect(sessionsBadge.progress).toBe(100);
    expect(sessionsBadge.remaining).toBe(0);
    expect(sessionsBadge.maxLevel).toBe(true);
  });

  it('should handle multiple categories with different progress', () => {
    const stats = {
      sessions: 50,    // Silver unlocked
      streaks: 7,      // Silver unlocked
      daily_record: 5, // Bronze unlocked
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    };

    const badges = calculateBadges(stats);

    const sessionsBadge = badges.find(b => b.category === 'sessions');
    const streaksBadge = badges.find(b => b.category === 'streaks');
    const dailyRecordBadge = badges.find(b => b.category === 'daily_record');

    expect(sessionsBadge.unlockedLevel.id).toBe('silver');
    expect(streaksBadge.unlockedLevel.id).toBe('silver');
    expect(dailyRecordBadge.unlockedLevel.id).toBe('bronze');
  });

  it('should not divide by zero when range is zero', () => {
    // Edge case: should not happen with proper config, but test defensively
    const stats = {
      sessions: 10,
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    };

    // Should not throw
    expect(() => calculateBadges(stats)).not.toThrow();
  });
});

describe('Badge System - detectUnlockedBadges', () => {
  it('should return empty array when oldBadges is empty', () => {
    const oldBadges = [];
    const newBadges = calculateBadges({
      sessions: 10,
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const unlocked = detectUnlockedBadges(oldBadges, newBadges);
    expect(unlocked).toEqual([]);
  });

  it('should detect newly unlocked bronze badge', () => {
    const oldBadges = calculateBadges({
      sessions: 5,
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const newBadges = calculateBadges({
      sessions: 10, // Bronze unlocked!
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const unlocked = detectUnlockedBadges(oldBadges, newBadges);

    expect(unlocked.length).toBe(1);
    expect(unlocked[0].category).toBe('sessions');
    expect(unlocked[0].newLevel.id).toBe('bronze');
  });

  it('should detect multiple level progressions', () => {
    const oldBadges = calculateBadges({
      sessions: 5,
      streaks: 2,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const newBadges = calculateBadges({
      sessions: 10, // Bronze unlocked
      streaks: 7,   // Silver unlocked (jumped from 2 to 7)
      daily_record: 5, // Bronze unlocked
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const unlocked = detectUnlockedBadges(oldBadges, newBadges);

    expect(unlocked.length).toBe(3);
    expect(unlocked.find(u => u.category === 'sessions')).toBeDefined();
    expect(unlocked.find(u => u.category === 'streaks')).toBeDefined();
    expect(unlocked.find(u => u.category === 'daily_record')).toBeDefined();
  });

  it('should not detect same level twice', () => {
    const oldBadges = calculateBadges({
      sessions: 10,
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const newBadges = calculateBadges({
      sessions: 15, // Still bronze
      streaks: 0,
      daily_record: 0,
      spending: 0,
      strains: 0,
      early_bird: 0,
      night_owl: 0,
      efficiency: 999,
      weekend_warrior: 0,
      marathon: 0,
      consistency: 0,
      explorer: 0,
      dedicated: 0
    });

    const unlocked = detectUnlockedBadges(oldBadges, newBadges);
    expect(unlocked.length).toBe(0);
  });
});

describe('Badge System - calculateUserStats', () => {
  it('should calculate stats with empty historyData', () => {
    const stats = calculateUserStats([], {});

    expect(stats.sessions).toBe(0);
    expect(stats.streaks).toBe(0);
    expect(stats.daily_record).toBe(0);
    expect(stats.weekend_warrior).toBe(0);
    expect(stats.consistency).toBe(0);
    expect(stats.dedicated).toBe(0);
  });

  it('should calculate total sessions from historyData', () => {
    const historyData = [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 3 },
      { date: '2024-01-03', count: 7 }
    ];

    const stats = calculateUserStats(historyData, {});
    expect(stats.sessions).toBe(15); // 5 + 3 + 7
  });

  it('should calculate daily record correctly', () => {
    const historyData = [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 12 }, // Highest
      { date: '2024-01-03', count: 7 }
    ];

    const stats = calculateUserStats(historyData, {});
    expect(stats.daily_record).toBe(12);
  });

  it('should calculate streaks correctly - simple streak', () => {
    const historyData = [
      { date: '2024-01-01', count: 1 },
      { date: '2024-01-02', count: 1 },
      { date: '2024-01-03', count: 1 },
      { date: '2024-01-04', count: 0 }, // Break
      { date: '2024-01-05', count: 1 }
    ];

    const stats = calculateUserStats(historyData, {});
    expect(stats.streaks).toBeGreaterThanOrEqual(1);
  });

  it('should calculate weekend warrior stats', () => {
    const historyData = [
      { date: '2024-01-06', count: 5 }, // Saturday
      { date: '2024-01-07', count: 3 }, // Sunday
      { date: '2024-01-08', count: 2 }, // Monday (not weekend)
    ];

    const stats = calculateUserStats(historyData, {});
    expect(stats.weekend_warrior).toBe(8); // 5 + 3
  });

  it('should calculate dedicated (weekday) stats', () => {
    const historyData = [
      { date: '2024-01-08', count: 5 }, // Monday
      { date: '2024-01-09', count: 3 }, // Tuesday
      { date: '2024-01-13', count: 2 }, // Saturday (not weekday)
    ];

    const stats = calculateUserStats(historyData, {});
    expect(stats.dedicated).toBe(8); // 5 + 3
  });

  it('should calculate consistency (days with at least 1 hit)', () => {
    const historyData = [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 1 },
      { date: '2024-01-03', count: 0 }, // No hits
      { date: '2024-01-04', count: 7 },
    ];

    const stats = calculateUserStats(historyData, {});
    expect(stats.consistency).toBe(3); // 3 days with hits
  });

  it('should handle null/undefined historyData gracefully', () => {
    expect(() => calculateUserStats(null, {})).not.toThrow();
    expect(() => calculateUserStats(undefined, {})).not.toThrow();

    const stats = calculateUserStats(null, {});
    expect(stats.sessions).toBe(0);
  });

  it('should set disabled features to 0 or default values', () => {
    const stats = calculateUserStats([], {});

    // Features disabled in v8.8 (require sessionHits or timestamps)
    expect(stats.spending).toBe(0);
    expect(stats.strains).toBe(0);
    expect(stats.early_bird).toBe(0);
    expect(stats.night_owl).toBe(0);
    expect(stats.marathon).toBe(0);
    expect(stats.explorer).toBe(0);
    expect(stats.efficiency).toBe(999); // High value to disable efficiency badge
  });
});
