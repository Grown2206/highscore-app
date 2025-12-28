import { Flame, Calendar, Star, Coins, Sparkles, Coffee, Moon, TrendingUp, Zap, Target, Award, Clock, Briefcase, PartyPopper } from 'lucide-react';

/**
 * ACHIEVEMENTS CONFIGURATION v3.0
 * Massiv erweitert mit mehr Levels und neuen Kategorien
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

  // TAGESREKORD (10 Stufen - MASSIV ERWEITERT)
  dailyRecord: [
    { threshold: 5, name: 'Guter Tag', icon: '😊', desc: '5+ Hits an einem Tag', color: 'from-yellow-400 to-yellow-500' },
    { threshold: 10, name: 'Party Mode', icon: '🎉', desc: '10+ Hits an einem Tag', color: 'from-pink-500 to-rose-500' },
    { threshold: 15, name: 'Hardcore', icon: '💪', desc: '15+ Hits an einem Tag', color: 'from-red-500 to-orange-500' },
    { threshold: 20, name: 'Absolut Wild', icon: '🤯', desc: '20+ Hits an einem Tag', color: 'from-purple-600 to-pink-600' },
    { threshold: 25, name: 'Übermenschlich', icon: '🦸', desc: '25+ Hits an einem Tag', color: 'from-blue-600 to-cyan-500' },
    { threshold: 30, name: 'Götterstatus', icon: '⚡👑', desc: '30+ Hits an einem Tag', color: 'from-yellow-500 to-orange-600' },
    { threshold: 35, name: 'Dimension X', icon: '🌌', desc: '35+ Hits an einem Tag', color: 'from-purple-700 to-indigo-600' },
    { threshold: 40, name: 'Zeitreisender', icon: '⏰🚀', desc: '40+ Hits an einem Tag', color: 'from-cyan-600 to-blue-700' },
    { threshold: 50, name: 'Unsterblich', icon: '🔥👑', desc: '50+ Hits an einem Tag', color: 'from-red-600 to-yellow-500' },
    { threshold: 75, name: 'Transzendent', icon: '✨🌟', desc: '75+ Hits an einem Tag', color: 'from-pink-600 to-purple-800' },
    { threshold: 100, name: 'Absolut Legendär', icon: '💫👑✨', desc: '100+ Hits an einem Tag', color: 'from-yellow-400 to-pink-600' }
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

  // FRÜHAUFSTEHER (8 Stufen - MASSIV ERWEITERT)
  earlyBird: [
    { threshold: 5, name: 'Morgenmuffel', icon: '🌅', desc: '5+ Morgensessions', color: 'from-orange-400 to-yellow-400' },
    { threshold: 15, name: 'Frühaufsteher', icon: '☕', desc: '15+ Morgensessions', color: 'from-yellow-500 to-orange-500' },
    { threshold: 30, name: 'Morgenröte', icon: '🌄', desc: '30+ Morgensessions', color: 'from-pink-400 to-orange-400' },
    { threshold: 50, name: 'Sonnenanbeter', icon: '☀️', desc: '50+ Morgensessions', color: 'from-yellow-400 to-orange-600' },
    { threshold: 75, name: 'Dawn Patrol', icon: '🌅✨', desc: '75+ Morgensessions', color: 'from-orange-500 to-red-500' },
    { threshold: 100, name: 'Meister der Morgenröte', icon: '👑☀️', desc: '100+ Morgensessions', color: 'from-yellow-300 to-orange-600' },
    { threshold: 150, name: 'Sonnenkrieger', icon: '⚔️🌅', desc: '150+ Morgensessions', color: 'from-amber-400 to-red-600' },
    { threshold: 200, name: 'Herrscher des Tagesanbruchs', icon: '👑🌄✨', desc: '200+ Morgensessions', color: 'from-yellow-200 to-orange-700' }
  ],

  // NACHTEULE (8 Stufen - MASSIV ERWEITERT)
  nightOwl: [
    { threshold: 5, name: 'Nachtaktiv', icon: '🌙', desc: '5+ Nachtsessions', color: 'from-indigo-500 to-purple-500' },
    { threshold: 15, name: 'Nachteule', icon: '🦉', desc: '15+ Nachtsessions', color: 'from-purple-500 to-pink-500' },
    { threshold: 30, name: 'Mitternachtskrieger', icon: '🌃', desc: '30+ Nachtsessions', color: 'from-blue-600 to-purple-600' },
    { threshold: 50, name: 'Vampir', icon: '🧛', desc: '50+ Nachtsessions', color: 'from-red-600 to-purple-700' },
    { threshold: 75, name: 'Fürst der Finsternis', icon: '🌑👑', desc: '75+ Nachtsessions', color: 'from-purple-700 to-indigo-800' },
    { threshold: 100, name: 'Mondkönig', icon: '🌙👑', desc: '100+ Nachtsessions', color: 'from-indigo-600 to-purple-800' },
    { threshold: 150, name: 'Schatten-Meister', icon: '🌃✨', desc: '150+ Nachtsessions', color: 'from-purple-800 to-black' },
    { threshold: 200, name: 'Herrscher der Nacht', icon: '🦇👑🌙', desc: '200+ Nachtsessions', color: 'from-indigo-900 to-purple-950' }
  ],

  // EFFIZIENZ (4 Stufen)
  efficiency: [
    { threshold: 2.0, name: 'Effizient', icon: '📈', desc: 'Ø 2+ Hits/Session', color: 'from-blue-400 to-cyan-400' },
    { threshold: 3.0, name: 'Produktiv', icon: '⚡', desc: 'Ø 3+ Hits/Session', color: 'from-green-500 to-teal-500' },
    { threshold: 4.0, name: 'Optimiert', icon: '🎯', desc: 'Ø 4+ Hits/Session', color: 'from-yellow-500 to-orange-500' },
    { threshold: 5.0, name: 'Perfektion', icon: '💯', desc: 'Ø 5+ Hits/Session', color: 'from-purple-500 to-pink-500' }
  ],

  // NEU: WOCHENEND-WARRIOR (6 Stufen)
  weekendWarrior: [
    { threshold: 10, name: 'Weekend Vibes', icon: '🎉', desc: '10+ Wochenend-Sessions', color: 'from-pink-400 to-rose-500' },
    { threshold: 25, name: 'Party Animal', icon: '🥳', desc: '25+ Wochenend-Sessions', color: 'from-purple-500 to-pink-600' },
    { threshold: 50, name: 'Weekend Warrior', icon: '⚔️🎊', desc: '50+ Wochenend-Sessions', color: 'from-orange-500 to-pink-500' },
    { threshold: 75, name: 'Freizeitkönig', icon: '👑🎉', desc: '75+ Wochenend-Sessions', color: 'from-yellow-500 to-red-500' },
    { threshold: 100, name: 'Meister der freien Tage', icon: '🏆🎊', desc: '100+ Wochenend-Sessions', color: 'from-purple-600 to-orange-600' },
    { threshold: 150, name: 'Ewiges Wochenende', icon: '♾️🎉', desc: '150+ Wochenend-Sessions', color: 'from-pink-600 to-purple-800' }
  ],

  // NEU: WERKTAGS-PROFESSIONAL (6 Stufen)
  weekdayPro: [
    { threshold: 10, name: 'After Work', icon: '💼', desc: '10+ Werktags-Sessions', color: 'from-blue-500 to-cyan-500' },
    { threshold: 25, name: 'Work-Life-Balance', icon: '⚖️', desc: '25+ Werktags-Sessions', color: 'from-green-500 to-blue-500' },
    { threshold: 50, name: 'Wochentags-Profi', icon: '💼✨', desc: '50+ Werktags-Sessions', color: 'from-cyan-500 to-indigo-500' },
    { threshold: 75, name: 'Büro-Legende', icon: '🏢👑', desc: '75+ Werktags-Sessions', color: 'from-blue-600 to-purple-600' },
    { threshold: 100, name: 'Corporate Champion', icon: '🎯💼', desc: '100+ Werktags-Sessions', color: 'from-indigo-600 to-cyan-700' },
    { threshold: 150, name: 'Meister der Produktivität', icon: '⚡💼👑', desc: '150+ Werktags-Sessions', color: 'from-blue-700 to-purple-800' }
  ],

  // NEU: GESCHWINDIGKEIT (5 Stufen)
  speedRunner: [
    { threshold: 10, name: 'Quick Draw', icon: '⚡', desc: '10+ schnelle Sessions (<30s)', color: 'from-yellow-400 to-orange-400' },
    { threshold: 25, name: 'Speed Demon', icon: '🏃‍♂️💨', desc: '25+ schnelle Sessions', color: 'from-orange-500 to-red-500' },
    { threshold: 50, name: 'Blitzschnell', icon: '⚡🔥', desc: '50+ schnelle Sessions', color: 'from-yellow-500 to-red-600' },
    { threshold: 75, name: 'Lichtgeschwindigkeit', icon: '💫⚡', desc: '75+ schnelle Sessions', color: 'from-cyan-500 to-yellow-500' },
    { threshold: 100, name: 'Zeitriss', icon: '⏰💥', desc: '100+ schnelle Sessions', color: 'from-purple-600 to-orange-600' }
  ],

  // NEU: GENIESSER (5 Stufen)
  enjoyer: [
    { threshold: 10, name: 'Entspannt', icon: '😌', desc: '10+ lange Sessions (>60s)', color: 'from-green-400 to-teal-400' },
    { threshold: 25, name: 'Genießer', icon: '🍷', desc: '25+ lange Sessions', color: 'from-purple-400 to-pink-400' },
    { threshold: 50, name: 'Zen-Meister', icon: '🧘', desc: '50+ lange Sessions', color: 'from-blue-500 to-purple-500' },
    { threshold: 75, name: 'Zeit-Dehner', icon: '⏳✨', desc: '75+ lange Sessions', color: 'from-indigo-500 to-pink-500' },
    { threshold: 100, name: 'Ewigkeit', icon: '♾️🌌', desc: '100+ lange Sessions', color: 'from-purple-700 to-indigo-800' }
  ]
};

// Progress-Badges Configuration - ERWEITERT
// Targets werden automatisch aus Medal Definitions abgeleitet, um Duplikation zu vermeiden
export const PROGRESS_BADGES = [
  {
    key: 'totalSessions',
    name: 'Sitzungen',
    icon: Flame,
    gradient: 'from-orange-500 to-red-500',
    targets: MEDAL_DEFINITIONS.sessions.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'currentStreak',
    name: 'Streak',
    icon: Calendar,
    gradient: 'from-purple-500 to-pink-500',
    targets: MEDAL_DEFINITIONS.streaks.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'dailyRecord',
    name: 'Tages-Rekord',
    icon: Star,
    gradient: 'from-yellow-500 to-amber-500',
    targets: MEDAL_DEFINITIONS.dailyRecord.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'totalSpending',
    name: 'Ausgaben',
    icon: Coins,
    gradient: 'from-green-500 to-emerald-500',
    targets: MEDAL_DEFINITIONS.spending.map(m => m.threshold),
    decimals: 0,
    suffix: '€'
  },
  {
    key: 'uniqueStrains',
    name: 'Sorten',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-500',
    targets: MEDAL_DEFINITIONS.strains.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'earlyBirdSessions',
    name: 'Frühaufsteher',
    icon: Coffee,
    gradient: 'from-yellow-400 to-orange-500',
    targets: MEDAL_DEFINITIONS.earlyBird.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'nightOwlSessions',
    name: 'Nachteule',
    icon: Moon,
    gradient: 'from-indigo-500 to-purple-500',
    targets: MEDAL_DEFINITIONS.nightOwl.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'efficiency',
    name: 'Effizienz',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-blue-500',
    targets: MEDAL_DEFINITIONS.efficiency.map(m => m.threshold),
    decimals: 1,
    suffix: ' Ø'
  },
  {
    key: 'weekendSessions',
    name: 'Weekend Warrior',
    icon: PartyPopper,
    gradient: 'from-pink-500 to-purple-600',
    targets: MEDAL_DEFINITIONS.weekendWarrior.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'weekdaySessions',
    name: 'Werktags-Profi',
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-600',
    targets: MEDAL_DEFINITIONS.weekdayPro.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'speedSessions',
    name: 'Speed Runner',
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-600',
    targets: MEDAL_DEFINITIONS.speedRunner.map(m => m.threshold),
    decimals: 0,
    suffix: ''
  },
  {
    key: 'slowSessions',
    name: 'Genießer',
    icon: Clock,
    gradient: 'from-green-400 to-purple-500',
    targets: MEDAL_DEFINITIONS.enjoyer.map(m => m.threshold),
    decimals: 0,
    suffix: ''
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

  // Mapping: statKey → medalDefinitions (ERWEITERT)
  const mapping = [
    { statKey: 'totalSessions', medals: MEDAL_DEFINITIONS.sessions, category: 'Sitzungen' },
    { statKey: 'currentStreak', medals: MEDAL_DEFINITIONS.streaks, category: 'Streaks' },
    { statKey: 'dailyRecord', medals: MEDAL_DEFINITIONS.dailyRecord, category: 'Tagesrekord' },
    { statKey: 'totalSpending', medals: MEDAL_DEFINITIONS.spending, category: 'Ausgaben' },
    { statKey: 'uniqueStrains', medals: MEDAL_DEFINITIONS.strains, category: 'Sorten' },
    { statKey: 'earlyBirdSessions', medals: MEDAL_DEFINITIONS.earlyBird, category: 'Frühaufsteher' },
    { statKey: 'nightOwlSessions', medals: MEDAL_DEFINITIONS.nightOwl, category: 'Nachteule' },
    { statKey: 'efficiency', medals: MEDAL_DEFINITIONS.efficiency, category: 'Effizienz' },
    { statKey: 'weekendSessions', medals: MEDAL_DEFINITIONS.weekendWarrior, category: 'Weekend Warrior' },
    { statKey: 'weekdaySessions', medals: MEDAL_DEFINITIONS.weekdayPro, category: 'Werktags-Profi' },
    { statKey: 'speedSessions', medals: MEDAL_DEFINITIONS.speedRunner, category: 'Speed Runner' },
    { statKey: 'slowSessions', medals: MEDAL_DEFINITIONS.enjoyer, category: 'Genießer' }
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
