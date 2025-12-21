import { Flame, Calendar, Star, Coins, Sparkles, Coffee, Moon, TrendingUp } from 'lucide-react';

/**
 * ACHIEVEMENTS CONFIGURATION
 * Single Source of Truth für alle Medaillen & Progress-Badges
 */

// Medaillen-Definitionen (alle Kategorien & Stufen)
export const MEDAL_DEFINITIONS = {
  // SITZUNGEN (6 Stufen)
  sessions: [
    { threshold: 1, name: 'Neuling', icon: '🌱', desc: 'Erste Session abgeschlossen', color: 'from-green-400 to-green-500' },
    { threshold: 10, name: 'Gewohnheitstier', icon: '🥉', desc: '10 Sessions erreicht', color: 'from-amber-600 to-amber-500' },
    { threshold: 50, name: 'Stammgast', icon: '🥈', desc: '50 Sessions erreicht', color: 'from-zinc-400 to-zinc-300' },
    { threshold: 100, name: 'Veteran', icon: '🥇', desc: '100 Sessions erreicht', color: 'from-yellow-500 to-yellow-400' },
    { threshold: 250, name: 'Legende', icon: '💎', desc: '250 Sessions erreicht', color: 'from-cyan-400 to-blue-500' },
    { threshold: 500, name: 'Meister des Universums', icon: '👑', desc: '500 Sessions erreicht', color: 'from-purple-500 to-pink-500' }
  ],

  // STREAKS (6 Stufen)
  streaks: [
    { threshold: 3, name: 'Auf Kurs', icon: '📈', desc: '3 Tage Streak', color: 'from-blue-400 to-blue-500' },
    { threshold: 7, name: 'Wochenkönig', icon: '🔥', desc: '7 Tage Streak', color: 'from-orange-500 to-red-500' },
    { threshold: 14, name: 'Unaufhaltsam', icon: '⚡', desc: '14 Tage Streak', color: 'from-purple-500 to-pink-500' },
    { threshold: 30, name: 'Marathon-Läufer', icon: '🏃', desc: '30 Tage Streak', color: 'from-green-500 to-emerald-500' },
    { threshold: 60, name: 'Eiserne Disziplin', icon: '🛡️', desc: '60 Tage Streak', color: 'from-gray-600 to-gray-500' },
    { threshold: 100, name: 'Zeitlos', icon: '♾️', desc: '100 Tage Streak', color: 'from-indigo-500 to-purple-500' }
  ],

  // TAGESREKORD (6 Stufen)
  dailyRecord: [
    { threshold: 5, name: 'Guter Tag', icon: '😊', desc: '5+ Hits an einem Tag', color: 'from-yellow-400 to-yellow-500' },
    { threshold: 10, name: 'Party Mode', icon: '🎉', desc: '10+ Hits an einem Tag', color: 'from-pink-500 to-rose-500' },
    { threshold: 15, name: 'Hardcore', icon: '💪', desc: '15+ Hits an einem Tag', color: 'from-red-500 to-orange-500' },
    { threshold: 20, name: 'Absolut Wild', icon: '🤯', desc: '20+ Hits an einem Tag', color: 'from-purple-600 to-pink-600' },
    { threshold: 25, name: 'Übermenschlich', icon: '🦸', desc: '25+ Hits an einem Tag', color: 'from-blue-600 to-cyan-500' },
    { threshold: 30, name: 'Götterstatus', icon: '⚡👑', desc: '30+ Hits an einem Tag', color: 'from-yellow-500 to-orange-600' }
  ],

  // AUSGABEN (5 Stufen)
  spending: [
    { threshold: 50, name: 'Sparschwein', icon: '🐷', desc: '50€ investiert', color: 'from-pink-400 to-pink-500' },
    { threshold: 200, name: 'Investor', icon: '💼', desc: '200€ investiert', color: 'from-blue-500 to-indigo-500' },
    { threshold: 500, name: 'High Roller', icon: '🎰', desc: '500€ investiert', color: 'from-green-500 to-emerald-500' },
    { threshold: 1000, name: 'Tycoon', icon: '💎', desc: '1000€ investiert', color: 'from-cyan-500 to-blue-600' },
    { threshold: 2000, name: 'Geldbaum', icon: '🌳💰', desc: '2000€ investiert', color: 'from-yellow-500 to-green-600' }
  ],

  // SORTEN (6 Stufen)
  strains: [
    { threshold: 3, name: 'Neugierig', icon: '🔍', desc: '3+ Sorten probiert', color: 'from-blue-400 to-blue-500' },
    { threshold: 5, name: 'Entdecker', icon: '🌿', desc: '5+ Sorten probiert', color: 'from-green-500 to-emerald-500' },
    { threshold: 10, name: 'Kenner', icon: '🍃', desc: '10+ Sorten probiert', color: 'from-emerald-500 to-teal-500' },
    { threshold: 15, name: 'Sommelier', icon: '🎩', desc: '15+ Sorten probiert', color: 'from-purple-500 to-pink-500' },
    { threshold: 20, name: 'Meister-Sammler', icon: '🏆', desc: '20+ Sorten probiert', color: 'from-yellow-500 to-orange-500' },
    { threshold: 30, name: 'Botaniker', icon: '🔬🌱', desc: '30+ Sorten probiert', color: 'from-green-600 to-teal-600' }
  ],

  // FRÜHAUFSTEHER (4 Stufen)
  earlyBird: [
    { threshold: 5, name: 'Morgenmuffel', icon: '🌅', desc: '5+ Morgensessions', color: 'from-orange-400 to-yellow-400' },
    { threshold: 15, name: 'Frühaufsteher', icon: '☕', desc: '15+ Morgensessions', color: 'from-yellow-500 to-orange-500' },
    { threshold: 30, name: 'Morgenröte', icon: '🌄', desc: '30+ Morgensessions', color: 'from-pink-400 to-orange-400' },
    { threshold: 50, name: 'Sonnenanbeter', icon: '☀️', desc: '50+ Morgensessions', color: 'from-yellow-400 to-orange-600' }
  ],

  // NACHTEULE (4 Stufen)
  nightOwl: [
    { threshold: 5, name: 'Nachtaktiv', icon: '🌙', desc: '5+ Nachtsessions', color: 'from-indigo-500 to-purple-500' },
    { threshold: 15, name: 'Nachteule', icon: '🦉', desc: '15+ Nachtsessions', color: 'from-purple-500 to-pink-500' },
    { threshold: 30, name: 'Mitternachtskrieger', icon: '🌃', desc: '30+ Nachtsessions', color: 'from-blue-600 to-purple-600' },
    { threshold: 50, name: 'Vampir', icon: '🧛', desc: '50+ Nachtsessions', color: 'from-red-600 to-purple-700' }
  ],

  // EFFIZIENZ (4 Stufen)
  efficiency: [
    { threshold: 2.0, name: 'Effizient', icon: '📈', desc: 'Ø 2+ Hits/Session', color: 'from-blue-400 to-cyan-400' },
    { threshold: 3.0, name: 'Produktiv', icon: '⚡', desc: 'Ø 3+ Hits/Session', color: 'from-green-500 to-teal-500' },
    { threshold: 4.0, name: 'Optimiert', icon: '🎯', desc: 'Ø 4+ Hits/Session', color: 'from-yellow-500 to-orange-500' },
    { threshold: 5.0, name: 'Perfektion', icon: '💯', desc: 'Ø 5+ Hits/Session', color: 'from-purple-500 to-pink-500' }
  ]
};

// Progress-Badges Configuration
export const PROGRESS_BADGES = [
  {
    key: 'totalSessions',
    name: 'Sitzungen',
    icon: Flame,
    gradient: 'from-orange-500 to-red-500',
    targets: [1, 10, 50, 100, 250, 500, 1000],
    decimals: 0,
    suffix: ''
  },
  {
    key: 'currentStreak',
    name: 'Streak',
    icon: Calendar,
    gradient: 'from-purple-500 to-pink-500',
    targets: [3, 7, 14, 30, 60, 100],
    decimals: 0,
    suffix: ''
  },
  {
    key: 'dailyRecord',
    name: 'Tages-Rekord',
    icon: Star,
    gradient: 'from-yellow-500 to-amber-500',
    targets: [5, 10, 15, 20, 25, 30],
    decimals: 0,
    suffix: ''
  },
  {
    key: 'totalSpending',
    name: 'Ausgaben',
    icon: Coins,
    gradient: 'from-green-500 to-emerald-500',
    targets: [50, 200, 500, 1000, 2000],
    decimals: 0,
    suffix: '€'
  },
  {
    key: 'uniqueStrains',
    name: 'Sorten',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-500',
    targets: [3, 5, 10, 15, 20, 30],
    decimals: 0,
    suffix: ''
  },
  {
    key: 'earlyBirdSessions',
    name: 'Frühaufsteher',
    icon: Coffee,
    gradient: 'from-yellow-400 to-orange-500',
    targets: [5, 15, 30, 50],
    decimals: 0,
    suffix: ''
  },
  {
    key: 'nightOwlSessions',
    name: 'Nachteule',
    icon: Moon,
    gradient: 'from-indigo-500 to-purple-500',
    targets: [5, 15, 30, 50],
    decimals: 0,
    suffix: ''
  },
  {
    key: 'efficiency',
    name: 'Effizienz',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-blue-500',
    targets: [2, 3, 4, 5],
    decimals: 1,
    suffix: ' Ø'
  }
];

// Helper: Finde nächstes Target
export function getNextTarget(current, targets) {
  const next = targets.find(t => t > current);
  return next || targets[targets.length - 1] || current;
}

// Helper: Generiere Medaillen basierend auf Stats
export function generateMedals(stats) {
  const earned = [];

  // Mapping: statKey → medalDefinitions
  const mapping = [
    { statKey: 'totalSessions', medals: MEDAL_DEFINITIONS.sessions, category: 'Sitzungen' },
    { statKey: 'currentStreak', medals: MEDAL_DEFINITIONS.streaks, category: 'Streaks' },
    { statKey: 'dailyRecord', medals: MEDAL_DEFINITIONS.dailyRecord, category: 'Tagesrekord' },
    { statKey: 'totalSpending', medals: MEDAL_DEFINITIONS.spending, category: 'Ausgaben' },
    { statKey: 'uniqueStrains', medals: MEDAL_DEFINITIONS.strains, category: 'Sorten' },
    { statKey: 'earlyBirdSessions', medals: MEDAL_DEFINITIONS.earlyBird, category: 'Frühaufsteher' },
    { statKey: 'nightOwlSessions', medals: MEDAL_DEFINITIONS.nightOwl, category: 'Nachteule' },
    { statKey: 'efficiency', medals: MEDAL_DEFINITIONS.efficiency, category: 'Effizienz' }
  ];

  mapping.forEach(({ statKey, medals, category }) => {
    const value = stats[statKey] || 0;
    medals.forEach(medal => {
      if (value >= medal.threshold) {
        earned.push({
          ...medal,
          category
        });
      }
    });
  });

  return earned;
}
