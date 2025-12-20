/**
 * ERWEITERTES BADGE-SYSTEM v7.0
 * Level-basierte Badges mit Unlock-Tracking und Animationen
 */

import { Trophy, Flame, Calendar, Coins, Clock, Tag, Star, Zap, TrendingUp, Coffee, Moon, Target, Sparkles, Award, BarChart } from 'lucide-react';

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

  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Sessions am Wochenende',
    Icon: Coffee,
    color: 'pink',
    levels: [
      { id: 'bronze', name: 'Wochenende', requirement: 5, icon: '🥉' },
      { id: 'silver', name: 'Party-Fan', requirement: 15, icon: '🥈' },
      { id: 'gold', name: 'Weekend-Pro', requirement: 30, icon: '🥇' },
      { id: 'platinum', name: 'Wochenend-Legende', requirement: 60, icon: '💎' },
    ]
  },

  MARATHON: {
    id: 'marathon',
    name: 'Marathon',
    description: 'Sessions über 5 Sekunden',
    Icon: Target,
    color: 'rose',
    levels: [
      { id: 'bronze', name: 'Ausdauer', requirement: 5, icon: '🥉' },
      { id: 'silver', name: 'Lungen-Kraft', requirement: 15, icon: '🥈' },
      { id: 'gold', name: 'Iron Lung', requirement: 30, icon: '🥇' },
      { id: 'platinum', name: 'Unendliche Lunge', requirement: 60, icon: '💎' },
    ]
  },

  CONSISTENCY: {
    id: 'consistency',
    name: 'Konsistenz',
    description: 'Tage mit mind. 1 Hit',
    Icon: BarChart,
    color: 'cyan',
    levels: [
      { id: 'bronze', name: 'Regelmäßig', requirement: 7, icon: '🥉' },
      { id: 'silver', name: 'Beständig', requirement: 30, icon: '🥈' },
      { id: 'gold', name: 'Verlässlich', requirement: 60, icon: '🥇' },
      { id: 'platinum', name: 'Eisern', requirement: 100, icon: '💎' },
    ]
  },

  EXPLORER: {
    id: 'explorer',
    name: 'Entdecker',
    description: 'Verschiedene Tageszeiten ausprobiert',
    Icon: Sparkles,
    color: 'violet',
    levels: [
      { id: 'bronze', name: 'Neugierig', requirement: 2, icon: '🥉' }, // 2 unterschiedliche Zeiten
      { id: 'silver', name: 'Vielseitig', requirement: 3, icon: '🥈' }, // 3 unterschiedliche Zeiten
      { id: 'gold', name: 'Abenteurer', requirement: 4, icon: '🥇' }, // 4 unterschiedliche Zeiten
      { id: 'platinum', name: 'Zeitreisender', requirement: 5, icon: '💎' }, // Alle 5 Zeiten
    ]
  },

  DEDICATED: {
    id: 'dedicated',
    name: 'Hingabe',
    description: 'Sessions an Werktagen',
    Icon: Award,
    color: 'amber',
    levels: [
      { id: 'bronze', name: 'Motiviert', requirement: 10, icon: '🥉' },
      { id: 'silver', name: 'Engagiert', requirement: 25, icon: '🥈' },
      { id: 'gold', name: 'Fokussiert', requirement: 50, icon: '🥇' },
      { id: 'platinum', name: 'Unaufhaltsam', requirement: 100, icon: '💎' },
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
    let remaining = 0;

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

      // Guard gegen Division durch Null
      if (range > 0) {
        progress = Math.min(100, Math.round((current / range) * 100));
      } else {
        // Fallback falls range === 0 (sollte nicht vorkommen bei korrekter Konfiguration)
        progress = 100;
      }

      remaining = nextLevel.requirement - currentValue;
    } else {
      // Alle Levels erreicht!
      progress = 100;
      remaining = 0;
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
      remaining,
      maxLevel: !nextLevel, // Alle Levels erreicht
    });
  });

  return badges;
}

/**
 * Erkenne neu freigeschaltete Badges
 * @param {Array} oldBadges - Vorherige Badge-Liste
 * @param {Array} newBadges - Aktuelle Badge-Liste
 * @returns {Array} - Liste neu freigeschalteter Badges
 */
export function detectUnlockedBadges(oldBadges, newBadges) {
  if (!oldBadges || oldBadges.length === 0) return [];

  const unlocked = [];

  newBadges.forEach(newBadge => {
    const oldBadge = oldBadges.find(b => b.category === newBadge.category);

    if (!oldBadge) return;

    // Prüfe ob ein neues Level erreicht wurde
    const oldLevelId = oldBadge.unlockedLevel?.id;
    const newLevelId = newBadge.unlockedLevel?.id;

    if (newLevelId && newLevelId !== oldLevelId) {
      unlocked.push({
        ...newBadge,
        newLevel: newBadge.unlockedLevel,
      });
    }
  });

  return unlocked;
}

/**
 * Berechne Benutzer-Stats aus sessionHits und historyData
 */
export function calculateUserStats(sessionHits, historyData, settings) {
  // Guards gegen undefined/null
  const safeSessionHits = Array.isArray(sessionHits) ? sessionHits : [];
  const safeHistoryData = Array.isArray(historyData) ? historyData : [];
  const safeSettings = settings || {};

  // Sessions
  const sessions = safeSessionHits.length;

  // Streaks (längster Streak)
  let currentStreak = 0;
  let maxStreak = 0;
  const sortedHistory = [...safeHistoryData].sort((a, b) => new Date(a.date) - new Date(b.date));

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
  const daily_record = safeHistoryData.length > 0
    ? Math.max(...safeHistoryData.map(d => d.count), 0)
    : 0;

  // Spending
  const spending = safeSessionHits.reduce((sum, h) => {
    const strain = safeSettings?.strains?.find(s => s.name === h.strainName);
    const price = strain?.price || h.strainPrice || 0;
    return sum + (safeSettings?.bowlSize || 0.3) * ((safeSettings?.weedRatio || 80) / 100) * price;
  }, 0);

  // Strains
  const strains = new Set(safeSessionHits.map(h => h.strainName)).size;

  // Early Bird (vor 8 Uhr)
  const early_bird = safeSessionHits.filter(h => new Date(h.timestamp).getHours() < 8).length;

  // Night Owl (nach 22 Uhr)
  const night_owl = safeSessionHits.filter(h => new Date(h.timestamp).getHours() >= 22).length;

  // Efficiency (durchschnittliche Kosten pro Session)
  const efficiency = sessions > 0 ? spending / sessions : 999; // Invertiert: niedriger = besser

  // Weekend Warrior (Sessions am Wochenende: Sa=6, So=0)
  const weekend_warrior = safeSessionHits.filter(h => {
    const day = new Date(h.timestamp).getDay();
    return day === 0 || day === 6;
  }).length;

  // Marathon (Sessions über 5 Sekunden)
  const marathon = safeSessionHits.filter(h => (h.duration || 0) > 5000).length;

  // Consistency (Anzahl der Tage mit mindestens 1 Hit)
  const daysWithHits = new Set(
    safeSessionHits.map(h => new Date(h.timestamp).toISOString().split('T')[0])
  ).size;
  const consistency = daysWithHits;

  // Explorer (Verschiedene Tageszeiten: Nacht, Morgen, Mittag, Abend, Spätnacht)
  const timePeriods = new Set();
  safeSessionHits.forEach(h => {
    const hour = new Date(h.timestamp).getHours();
    if (hour >= 0 && hour < 6) timePeriods.add('night'); // 0-6: Nacht
    else if (hour >= 6 && hour < 12) timePeriods.add('morning'); // 6-12: Morgen
    else if (hour >= 12 && hour < 17) timePeriods.add('afternoon'); // 12-17: Mittag
    else if (hour >= 17 && hour < 22) timePeriods.add('evening'); // 17-22: Abend
    else timePeriods.add('latenight'); // 22-24: Spätnacht
  });
  const explorer = timePeriods.size;

  // Dedicated (Sessions an Werktagen: Mo-Fr = 1-5)
  const dedicated = safeSessionHits.filter(h => {
    const day = new Date(h.timestamp).getDay();
    return day >= 1 && day <= 5;
  }).length;

  return {
    sessions,
    streaks: maxStreak,
    daily_record,
    spending,
    strains,
    early_bird,
    night_owl,
    efficiency,
    weekend_warrior,
    marathon,
    consistency,
    explorer,
    dedicated,
  };
}
