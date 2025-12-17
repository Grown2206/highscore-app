/**
 * NEUES BADGE-SYSTEM
 * Einfacher, robuster Ansatz mit Level-basierten Badges
 */

import { Trophy, Flame, Calendar, Coins, Clock, Tag, Star, Zap, TrendingUp } from 'lucide-react';

/**
 * Badge-Kategorien mit Level-Stufen
 * Jedes Badge hat Bronze, Silber, Gold Level
 */

export const BADGE_CATEGORIES = {
  SESSIONS: {
    id: 'sessions',
    name: 'Sessions',
    description: 'Gesamtanzahl an Sessions',
    Icon: Flame,
    color: 'orange',
    levels: [
      { id: 'bronze', name: 'Anfänger', requirement: 10, icon: '🥉' },
      { id: 'silver', name: 'Fortgeschritten', requirement: 50, icon: '🥈' },
      { id: 'gold', name: 'Meister', requirement: 100, icon: '🥇' },
      { id: 'platinum', name: 'Legende', requirement: 500, icon: '💎' },
    ]
  },

  STREAKS: {
    id: 'streaks',
    name: 'Streaks',
    description: 'Tage in Folge',
    Icon: Calendar,
    color: 'purple',
    levels: [
      { id: 'bronze', name: 'Konsistent', requirement: 3, icon: '🥉' },
      { id: 'silver', name: 'Hingabe', requirement: 7, icon: '🥈' },
      { id: 'gold', name: 'Unaufhaltsam', requirement: 14, icon: '🥇' },
      { id: 'platinum', name: 'Legendär', requirement: 30, icon: '💎' },
    ]
  },

  DAILY_RECORD: {
    id: 'daily_record',
    name: 'Tages-Rekord',
    description: 'Meiste Hits an einem Tag',
    Icon: Star,
    color: 'yellow',
    levels: [
      { id: 'bronze', name: 'Guter Tag', requirement: 5, icon: '🥉' },
      { id: 'silver', name: 'Party Mode', requirement: 10, icon: '🥈' },
      { id: 'gold', name: 'Hardcore', requirement: 15, icon: '🥇' },
      { id: 'platinum', name: 'Legendär', requirement: 25, icon: '💎' },
    ]
  },

  SPENDING: {
    id: 'spending',
    name: 'Ausgaben',
    description: 'Gesamtausgaben',
    Icon: Coins,
    color: 'green',
    levels: [
      { id: 'bronze', name: 'Starter', requirement: 50, icon: '🥉' },
      { id: 'silver', name: 'Investor', requirement: 200, icon: '🥈' },
      { id: 'gold', name: 'High Roller', requirement: 500, icon: '🥇' },
      { id: 'platinum', name: 'Tycoon', requirement: 1000, icon: '💎' },
    ]
  },

  STRAINS: {
    id: 'strains',
    name: 'Sorten',
    description: 'Verschiedene Sorten probiert',
    Icon: Tag,
    color: 'emerald',
    levels: [
      { id: 'bronze', name: 'Neugierig', requirement: 3, icon: '🥉' },
      { id: 'silver', name: 'Entdecker', requirement: 5, icon: '🥈' },
      { id: 'gold', name: 'Kenner', requirement: 10, icon: '🥇' },
      { id: 'platinum', name: 'Sammler', requirement: 20, icon: '💎' },
    ]
  },

  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Frühaufsteher',
    description: 'Sessions vor 8 Uhr',
    Icon: Clock,
    color: 'blue',
    levels: [
      { id: 'bronze', name: 'Morgenmuffel', requirement: 1, icon: '🥉' },
      { id: 'silver', name: 'Frühaufsteher', requirement: 5, icon: '🥈' },
      { id: 'gold', name: 'Morgenperson', requirement: 10, icon: '🥇' },
      { id: 'platinum', name: 'Sonnenaufgang', requirement: 25, icon: '💎' },
    ]
  },

  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Nachteule',
    description: 'Sessions nach 22 Uhr',
    Icon: Clock,
    color: 'indigo',
    levels: [
      { id: 'bronze', name: 'Nachtaktiv', requirement: 1, icon: '🥉' },
      { id: 'silver', name: 'Nachteule', requirement: 5, icon: '🥈' },
      { id: 'gold', name: 'Midnight Toker', requirement: 10, icon: '🥇' },
      { id: 'platinum', name: 'Vampir', requirement: 25, icon: '💎' },
    ]
  },

  EFFICIENCY: {
    id: 'efficiency',
    name: 'Effizienz',
    description: 'Ø Kosten pro Session niedrig halten',
    Icon: TrendingUp,
    color: 'teal',
    levels: [
      { id: 'bronze', name: 'Sparsam', requirement: 3, icon: '🥉' }, // <3€/Session
      { id: 'silver', name: 'Sparfuchs', requirement: 2, icon: '🥈' }, // <2€/Session
      { id: 'gold', name: 'Budget-König', requirement: 1.5, icon: '🥇' }, // <1.5€/Session
      { id: 'platinum', name: 'Meister-Sparer', requirement: 1, icon: '💎' }, // <1€/Session
    ]
  },
};

/**
 * Berechne Badge-Fortschritt basierend auf Stats
 * @param {Object} stats - Benutzer-Statistiken
 * @returns {Array} - Array mit Badge-Status
 */
export function calculateBadges(stats) {
  const badges = [];

  Object.values(BADGE_CATEGORIES).forEach(category => {
    const currentValue = stats[category.id] || 0;
    let unlockedLevel = null;
    let nextLevel = category.levels[0];
    let progress = 0;

    // Finde höchstes freigeschaltetes Level
    for (let i = 0; i < category.levels.length; i++) {
      const level = category.levels[i];

      if (currentValue >= level.requirement) {
        unlockedLevel = level;
        // Nächstes Level (falls vorhanden)
        nextLevel = category.levels[i + 1] || null;
      } else {
        // Aktuelles Level noch nicht erreicht
        nextLevel = level;
        break;
      }
    }

    // Berechne Fortschritt zum nächsten Level
    if (nextLevel) {
      const prevReq = unlockedLevel ? unlockedLevel.requirement : 0;
      const range = nextLevel.requirement - prevReq;
      const current = currentValue - prevReq;
      progress = Math.min(100, Math.round((current / range) * 100));
    } else {
      // Alle Levels erreicht!
      progress = 100;
    }

    badges.push({
      category: category.id,
      name: category.name,
      description: category.description,
      Icon: category.Icon,
      color: category.color,
      currentValue,
      unlockedLevel,
      nextLevel,
      progress,
      maxLevel: !nextLevel, // Alle Levels erreicht
    });
  });

  return badges;
}

/**
 * Berechne Benutzer-Stats aus sessionHits und historyData
 */
export function calculateUserStats(sessionHits, historyData, settings) {
  // Sessions
  const sessions = sessionHits.length;

  // Streaks (längster Streak)
  let currentStreak = 0;
  let maxStreak = 0;
  const sortedHistory = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = sortedHistory.length - 1; i >= 0; i--) {
    if (sortedHistory[i].count > 0) {
      currentStreak++;
      if (i > 0) {
        const daysDiff = Math.floor(
          (new Date(sortedHistory[i].date) - new Date(sortedHistory[i - 1].date)) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 0;
        }
      }
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);

  // Daily Record
  const daily_record = Math.max(...historyData.map(d => d.count), 0);

  // Spending
  const spending = sessionHits.reduce((sum, h) => {
    const strain = settings?.strains?.find(s => s.name === h.strainName);
    const price = strain?.price || h.strainPrice || 0;
    return sum + (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100) * price;
  }, 0);

  // Strains
  const strains = new Set(sessionHits.map(h => h.strainName)).size;

  // Early Bird (vor 8 Uhr)
  const early_bird = sessionHits.filter(h => new Date(h.timestamp).getHours() < 8).length;

  // Night Owl (nach 22 Uhr)
  const night_owl = sessionHits.filter(h => new Date(h.timestamp).getHours() >= 22).length;

  // Efficiency (durchschnittliche Kosten pro Session)
  const efficiency = sessions > 0 ? spending / sessions : 999; // Invertiert: niedriger = besser

  return {
    sessions,
    streaks: maxStreak,
    daily_record,
    spending,
    strains,
    early_bird,
    night_owl,
    efficiency,
  };
}
