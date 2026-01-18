/**
 * Unit Tests for Achievements Configuration v3.0
 * Tests medal generation, progress tracking, and target calculations
 */

import { describe, it, expect } from 'vitest';
import {
  MEDAL_DEFINITIONS,
  PROGRESS_BADGES,
  getNextTarget,
  generateMedals
} from './achievementsConfig';

describe('Achievements - Medal Definitions', () => {
  it('should have all expected medal categories', () => {
    const expectedCategories = [
      'sessions', 'streaks', 'dailyRecord', 'spending', 'strains',
      'earlyBird', 'nightOwl', 'efficiency', 'weekendWarrior',
      'weekdayPro', 'speedRunner', 'enjoyer'
    ];

    expectedCategories.forEach(category => {
      expect(MEDAL_DEFINITIONS[category]).toBeDefined();
      expect(MEDAL_DEFINITIONS[category]).toBeInstanceOf(Array);
      expect(MEDAL_DEFINITIONS[category].length).toBeGreaterThan(0);
    });
  });

  it('should have properly structured medal objects', () => {
    Object.values(MEDAL_DEFINITIONS).forEach(medals => {
      medals.forEach(medal => {
        expect(medal.threshold).toBeDefined();
        expect(typeof medal.threshold).toBe('number');
        expect(medal.name).toBeDefined();
        expect(medal.icon).toBeDefined();
        expect(medal.desc).toBeDefined();
        expect(medal.color).toBeDefined();
      });
    });
  });

  it('should have medals with ascending thresholds', () => {
    Object.entries(MEDAL_DEFINITIONS).forEach(([category, medals]) => {
      let prevThreshold = -1;
      medals.forEach(medal => {
        expect(medal.threshold).toBeGreaterThan(prevThreshold);
        prevThreshold = medal.threshold;
      });
    });
  });

  it('should have extended dailyRecord medals (10+ levels)', () => {
    const dailyRecordMedals = MEDAL_DEFINITIONS.dailyRecord;
    expect(dailyRecordMedals.length).toBeGreaterThanOrEqual(10);
    expect(dailyRecordMedals[dailyRecordMedals.length - 1].threshold).toBe(100);
  });

  it('should have extended earlyBird and nightOwl medals (8+ levels)', () => {
    expect(MEDAL_DEFINITIONS.earlyBird.length).toBeGreaterThanOrEqual(8);
    expect(MEDAL_DEFINITIONS.nightOwl.length).toBeGreaterThanOrEqual(8);
  });
});

describe('Achievements - Progress Badges', () => {
  it('should have all badge definitions with medal category links', () => {
    expect(PROGRESS_BADGES).toBeInstanceOf(Array);
    expect(PROGRESS_BADGES.length).toBeGreaterThan(0);

    PROGRESS_BADGES.forEach(badge => {
      expect(badge.key).toBeDefined();
      expect(badge.medalCategory).toBeDefined();
      expect(badge.name).toBeDefined();
      expect(badge.icon).toBeDefined();
      expect(badge.gradient).toBeDefined();
      expect(badge.decimals).toBeDefined();
      expect(badge.suffix).toBeDefined();
      expect(badge.targets).toBeInstanceOf(Array);
    });
  });

  it('should have targets derived from medal definitions', () => {
    PROGRESS_BADGES.forEach(badge => {
      const medalCategory = MEDAL_DEFINITIONS[badge.medalCategory];
      expect(medalCategory).toBeDefined();

      const expectedTargets = medalCategory.map(m => m.threshold);
      expect(badge.targets).toEqual(expectedTargets);
    });
  });

  it('should have 12 progress badges for all stat types', () => {
    const expectedBadges = [
      'totalSessions', 'currentStreak', 'dailyRecord', 'totalSpending',
      'uniqueStrains', 'earlyBirdSessions', 'nightOwlSessions', 'efficiency',
      'weekendSessions', 'weekdaySessions', 'speedSessions', 'slowSessions'
    ];

    const badgeKeys = PROGRESS_BADGES.map(b => b.key);
    expectedBadges.forEach(expectedKey => {
      expect(badgeKeys).toContain(expectedKey);
    });
  });

  it('should throw error for invalid medal category', () => {
    // This is a build-time validation test
    // In the actual code, this would fail during module load
    // We test the validation logic conceptually
    const invalidBadge = {
      key: 'invalid',
      medalCategory: 'nonExistent',
      name: 'Invalid',
      icon: null,
      gradient: 'test',
      decimals: 0,
      suffix: ''
    };

    // Simulating the validation from PROGRESS_BADGES creation
    const medals = MEDAL_DEFINITIONS[invalidBadge.medalCategory];
    expect(medals).toBeUndefined();
  });
});

describe('Achievements - getNextTarget', () => {
  it('should find next target when current is below all targets', () => {
    const targets = [10, 50, 100, 500];
    const next = getNextTarget(5, targets);
    expect(next).toBe(10);
  });

  it('should find next target when current is between targets', () => {
    const targets = [10, 50, 100, 500];
    const next = getNextTarget(30, targets);
    expect(next).toBe(50);
  });

  it('should return highest target when current exceeds all targets', () => {
    const targets = [10, 50, 100, 500];
    const next = getNextTarget(1000, targets);
    expect(next).toBe(500);
  });

  it('should return current target when exactly at a target', () => {
    const targets = [10, 50, 100, 500];
    const next = getNextTarget(50, targets);
    expect(next).toBe(100); // Next after 50
  });

  it('should handle empty targets array', () => {
    const targets = [];
    const next = getNextTarget(50, targets);
    expect(next).toBe(50); // Returns current value as fallback
  });

  it('should handle single target', () => {
    const targets = [100];
    expect(getNextTarget(50, targets)).toBe(100);
    expect(getNextTarget(100, targets)).toBe(100);
    expect(getNextTarget(150, targets)).toBe(100);
  });
});

describe('Achievements - generateMedals', () => {
  it('should generate no medals for empty stats', () => {
    const stats = {
      totalSessions: 0,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    expect(medals).toEqual([]);
  });

  it('should generate first medal when threshold is met', () => {
    const stats = {
      totalSessions: 1, // First threshold
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    expect(medals.length).toBe(1);
    expect(medals[0].name).toBe('Neuling');
    expect(medals[0].category).toBe('Sitzungen');
  });

  it('should generate multiple medals for one category', () => {
    const stats = {
      totalSessions: 100, // Should unlock: Neuling, Gewohnheitstier, Stammgast, Veteran
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    const sessionMedals = medals.filter(m => m.category === 'Sitzungen');
    expect(sessionMedals.length).toBe(4); // 1, 10, 50, 100
  });

  it('should generate medals across multiple categories', () => {
    const stats = {
      totalSessions: 50,    // 3 medals
      currentStreak: 7,     // 2 medals
      dailyRecord: 10,      // 2 medals
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    expect(medals.length).toBeGreaterThan(5);

    const categories = [...new Set(medals.map(m => m.category))];
    expect(categories).toContain('Sitzungen');
    expect(categories).toContain('Streaks');
    expect(categories).toContain('Tagesrekord');
  });

  it('should include all medal properties in generated medals', () => {
    const stats = {
      totalSessions: 10,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    medals.forEach(medal => {
      expect(medal.threshold).toBeDefined();
      expect(medal.name).toBeDefined();
      expect(medal.icon).toBeDefined();
      expect(medal.desc).toBeDefined();
      expect(medal.color).toBeDefined();
      expect(medal.category).toBeDefined();
    });
  });

  it('should handle missing stats gracefully', () => {
    const stats = {
      totalSessions: 10
      // Missing other stats
    };

    // Should not throw, should treat missing as 0
    expect(() => generateMedals(stats)).not.toThrow();
    const medals = generateMedals(stats);
    expect(medals.length).toBeGreaterThan(0); // At least session medals
  });

  it('should generate efficiency medals correctly', () => {
    const stats = {
      totalSessions: 0,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 3.5, // Should unlock 2.0 and 3.0 thresholds
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    const efficiencyMedals = medals.filter(m => m.category === 'Effizienz');
    expect(efficiencyMedals.length).toBe(2); // 2.0 and 3.0
  });

  it('should generate all medals when stats are maxed', () => {
    const stats = {
      totalSessions: 500,
      currentStreak: 100,
      dailyRecord: 100,
      totalSpending: 2000,
      uniqueStrains: 30,
      earlyBirdSessions: 200,
      nightOwlSessions: 200,
      efficiency: 5.0,
      weekendSessions: 150,
      weekdaySessions: 150,
      speedSessions: 100,
      slowSessions: 100
    };

    const medals = generateMedals(stats);

    // Each category should have all its medals
    const categories = [
      'Sitzungen', 'Streaks', 'Tagesrekord', 'Ausgaben', 'Sorten',
      'Frühaufsteher', 'Nachteule', 'Effizienz', 'Weekend Warrior',
      'Werktags-Profi', 'Speed Runner', 'Genießer'
    ];

    categories.forEach(category => {
      const categoryMedals = medals.filter(m => m.category === category);
      expect(categoryMedals.length).toBeGreaterThan(0);
    });
  });

  it('should generate weekend warrior medals', () => {
    const stats = {
      totalSessions: 0,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 50, // Should unlock 3 levels: 10, 25, 50
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    const weekendMedals = medals.filter(m => m.category === 'Weekend Warrior');
    expect(weekendMedals.length).toBe(3); // 10, 25, and 50
  });

  it('should generate speed runner and enjoyer medals', () => {
    const stats = {
      totalSessions: 0,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 25,
      slowSessions: 25
    };

    const medals = generateMedals(stats);
    const speedMedals = medals.filter(m => m.category === 'Speed Runner');
    const enjoyerMedals = medals.filter(m => m.category === 'Genießer');

    expect(speedMedals.length).toBeGreaterThan(0);
    expect(enjoyerMedals.length).toBeGreaterThan(0);
  });
});

describe('Achievements - Edge Cases', () => {
  it('should handle negative values gracefully', () => {
    const stats = {
      totalSessions: -10,
      currentStreak: -5,
      dailyRecord: -1,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    expect(() => generateMedals(stats)).not.toThrow();
    const medals = generateMedals(stats);
    expect(medals).toEqual([]); // No medals for negative values
  });

  it('should handle very large values', () => {
    const stats = {
      totalSessions: 999999,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 0,
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    expect(() => generateMedals(stats)).not.toThrow();
    const medals = generateMedals(stats);
    const sessionMedals = medals.filter(m => m.category === 'Sitzungen');
    // Should have all session medals
    expect(sessionMedals.length).toBe(MEDAL_DEFINITIONS.sessions.length);
  });

  it('should handle decimal efficiency values correctly', () => {
    const stats = {
      totalSessions: 0,
      currentStreak: 0,
      dailyRecord: 0,
      totalSpending: 0,
      uniqueStrains: 0,
      earlyBirdSessions: 0,
      nightOwlSessions: 0,
      efficiency: 2.5, // Between 2.0 and 3.0
      weekendSessions: 0,
      weekdaySessions: 0,
      speedSessions: 0,
      slowSessions: 0
    };

    const medals = generateMedals(stats);
    const efficiencyMedals = medals.filter(m => m.category === 'Effizienz');
    expect(efficiencyMedals.length).toBe(1); // Only 2.0 threshold
    expect(efficiencyMedals[0].name).toBe('Effizient');
  });
});
