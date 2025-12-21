import React, { useMemo } from 'react';
import {
  Trophy, Award, Star, Medal, Crown, Flame, Calendar, Zap,
  Coffee, Moon, TrendingUp, Coins, Sparkles, Target, Gift, Rocket
} from 'lucide-react';

/**
 * ERWEITERTES ACHIEVEMENTS-SYSTEM v2.0
 * 8 Kategorien, 30+ Medaillen, lustige Bezeichnungen
 */

function AchievementsView({ sessionHits = [], historyData = [] }) {
  // Sichere & erweiterte Stats-Berechnung
  const stats = useMemo(() => {
    try {
      const safeHits = Array.isArray(sessionHits) ? sessionHits : [];
      const safeHistory = Array.isArray(historyData) ? historyData : [];

      // Basis-Stats
      const totalSessions = safeHits.length || 0;
      const totalHits = safeHistory.reduce((sum, day) => sum + (day?.count || 0), 0);
      const dailyRecord = safeHistory.length > 0
        ? Math.max(...safeHistory.map(d => d?.count || 0))
        : 0;
      const currentStreak = calculateStreak(safeHistory);
      const uniqueStrains = new Set(safeHits.map(h => h?.strain).filter(Boolean)).size || 0;
      const totalSpending = safeHits.reduce((sum, h) => sum + (parseFloat(h?.price) || 0), 0);

      // Erweiterte Stats: Frühaufsteher (vor 10 Uhr)
      const earlyBirdSessions = safeHits.filter(h => {
        if (!h?.timestamp) return false;
        const hour = new Date(h.timestamp).getHours();
        return hour >= 5 && hour < 10;
      }).length;

      // Nachteule (nach 22 Uhr)
      const nightOwlSessions = safeHits.filter(h => {
        if (!h?.timestamp) return false;
        const hour = new Date(h.timestamp).getHours();
        return hour >= 22 || hour < 5;
      }).length;

      // Effizienz (Ø Hits pro Session)
      const efficiency = totalSessions > 0
        ? Math.round((totalHits / totalSessions) * 10) / 10
        : 0;

      return {
        totalSessions,
        totalHits,
        dailyRecord,
        currentStreak,
        uniqueStrains,
        totalSpending,
        earlyBirdSessions,
        nightOwlSessions,
        efficiency
      };
    } catch (error) {
      console.error('AchievementsView: stats calculation failed', error);
      return {
        totalSessions: 0,
        totalHits: 0,
        dailyRecord: 0,
        currentStreak: 0,
        uniqueStrains: 0,
        totalSpending: 0,
        earlyBirdSessions: 0,
        nightOwlSessions: 0,
        efficiency: 0
      };
    }
  }, [sessionHits, historyData]);

  // MASSIV erweiterte Medaillen mit lustigen Namen
  const medals = useMemo(() => {
    const earned = [];

    // 🔥 SITZUNGEN (Gesamtanzahl) - 6 Stufen
    if (stats.totalSessions >= 1) earned.push({
      name: 'Neuling',
      icon: '🌱',
      desc: 'Erste Session abgeschlossen',
      color: 'from-green-400 to-green-500',
      category: 'Sitzungen'
    });
    if (stats.totalSessions >= 10) earned.push({
      name: 'Gewohnheitstier',
      icon: '🥉',
      desc: '10 Sessions erreicht',
      color: 'from-amber-600 to-amber-500',
      category: 'Sitzungen'
    });
    if (stats.totalSessions >= 50) earned.push({
      name: 'Stammgast',
      icon: '🥈',
      desc: '50 Sessions erreicht',
      color: 'from-zinc-400 to-zinc-300',
      category: 'Sitzungen'
    });
    if (stats.totalSessions >= 100) earned.push({
      name: 'Veteran',
      icon: '🥇',
      desc: '100 Sessions erreicht',
      color: 'from-yellow-500 to-yellow-400',
      category: 'Sitzungen'
    });
    if (stats.totalSessions >= 250) earned.push({
      name: 'Legende',
      icon: '💎',
      desc: '250 Sessions erreicht',
      color: 'from-cyan-400 to-blue-500',
      category: 'Sitzungen'
    });
    if (stats.totalSessions >= 500) earned.push({
      name: 'Meister des Universums',
      icon: '👑',
      desc: '500 Sessions erreicht',
      color: 'from-purple-500 to-pink-500',
      category: 'Sitzungen'
    });

    // 🔥 STREAKS (Konsistenz) - 6 Stufen
    if (stats.currentStreak >= 3) earned.push({
      name: 'Auf Kurs',
      icon: '📈',
      desc: '3 Tage Streak',
      color: 'from-blue-400 to-blue-500',
      category: 'Streaks'
    });
    if (stats.currentStreak >= 7) earned.push({
      name: 'Wochenkönig',
      icon: '🔥',
      desc: '7 Tage Streak',
      color: 'from-orange-500 to-red-500',
      category: 'Streaks'
    });
    if (stats.currentStreak >= 14) earned.push({
      name: 'Unaufhaltsam',
      icon: '⚡',
      desc: '14 Tage Streak',
      color: 'from-purple-500 to-pink-500',
      category: 'Streaks'
    });
    if (stats.currentStreak >= 30) earned.push({
      name: 'Marathon-Läufer',
      icon: '🏃',
      desc: '30 Tage Streak',
      color: 'from-green-500 to-emerald-500',
      category: 'Streaks'
    });
    if (stats.currentStreak >= 60) earned.push({
      name: 'Eiserne Disziplin',
      icon: '🛡️',
      desc: '60 Tage Streak',
      color: 'from-gray-600 to-gray-500',
      category: 'Streaks'
    });
    if (stats.currentStreak >= 100) earned.push({
      name: 'Zeitlos',
      icon: '♾️',
      desc: '100 Tage Streak',
      color: 'from-indigo-500 to-purple-500',
      category: 'Streaks'
    });

    // 🎯 TAGESREKORD (Maximale Hits/Tag) - 6 Stufen
    if (stats.dailyRecord >= 5) earned.push({
      name: 'Guter Tag',
      icon: '😊',
      desc: '5+ Hits an einem Tag',
      color: 'from-yellow-400 to-yellow-500',
      category: 'Tagesrekord'
    });
    if (stats.dailyRecord >= 10) earned.push({
      name: 'Party Mode',
      icon: '🎉',
      desc: '10+ Hits an einem Tag',
      color: 'from-pink-500 to-rose-500',
      category: 'Tagesrekord'
    });
    if (stats.dailyRecord >= 15) earned.push({
      name: 'Hardcore',
      icon: '💪',
      desc: '15+ Hits an einem Tag',
      color: 'from-red-500 to-orange-500',
      category: 'Tagesrekord'
    });
    if (stats.dailyRecord >= 20) earned.push({
      name: 'Absolut Wild',
      icon: '🤯',
      desc: '20+ Hits an einem Tag',
      color: 'from-purple-600 to-pink-600',
      category: 'Tagesrekord'
    });
    if (stats.dailyRecord >= 25) earned.push({
      name: 'Übermenschlich',
      icon: '🦸',
      desc: '25+ Hits an einem Tag',
      color: 'from-blue-600 to-cyan-500',
      category: 'Tagesrekord'
    });
    if (stats.dailyRecord >= 30) earned.push({
      name: 'Götterstatus',
      icon: '⚡👑',
      desc: '30+ Hits an einem Tag',
      color: 'from-yellow-500 to-orange-600',
      category: 'Tagesrekord'
    });

    // 💰 AUSGABEN (Budget-Tracking) - 5 Stufen
    if (stats.totalSpending >= 50) earned.push({
      name: 'Sparschwein',
      icon: '🐷',
      desc: '50€ investiert',
      color: 'from-pink-400 to-pink-500',
      category: 'Ausgaben'
    });
    if (stats.totalSpending >= 200) earned.push({
      name: 'Investor',
      icon: '💼',
      desc: '200€ investiert',
      color: 'from-blue-500 to-indigo-500',
      category: 'Ausgaben'
    });
    if (stats.totalSpending >= 500) earned.push({
      name: 'High Roller',
      icon: '🎰',
      desc: '500€ investiert',
      color: 'from-green-500 to-emerald-500',
      category: 'Ausgaben'
    });
    if (stats.totalSpending >= 1000) earned.push({
      name: 'Tycoon',
      icon: '💎',
      desc: '1000€ investiert',
      color: 'from-cyan-500 to-blue-600',
      category: 'Ausgaben'
    });
    if (stats.totalSpending >= 2000) earned.push({
      name: 'Geldbaum',
      icon: '🌳💰',
      desc: '2000€ investiert',
      color: 'from-yellow-500 to-green-600',
      category: 'Ausgaben'
    });

    // 🌿 SORTEN (Vielfalt) - 6 Stufen
    if (stats.uniqueStrains >= 3) earned.push({
      name: 'Neugierig',
      icon: '🔍',
      desc: '3+ Sorten probiert',
      color: 'from-blue-400 to-blue-500',
      category: 'Sorten'
    });
    if (stats.uniqueStrains >= 5) earned.push({
      name: 'Entdecker',
      icon: '🌿',
      desc: '5+ Sorten probiert',
      color: 'from-green-500 to-emerald-500',
      category: 'Sorten'
    });
    if (stats.uniqueStrains >= 10) earned.push({
      name: 'Kenner',
      icon: '🍃',
      desc: '10+ Sorten probiert',
      color: 'from-emerald-500 to-teal-500',
      category: 'Sorten'
    });
    if (stats.uniqueStrains >= 15) earned.push({
      name: 'Sommelier',
      icon: '🎩',
      desc: '15+ Sorten probiert',
      color: 'from-purple-500 to-pink-500',
      category: 'Sorten'
    });
    if (stats.uniqueStrains >= 20) earned.push({
      name: 'Meister-Sammler',
      icon: '🏆',
      desc: '20+ Sorten probiert',
      color: 'from-yellow-500 to-orange-500',
      category: 'Sorten'
    });
    if (stats.uniqueStrains >= 30) earned.push({
      name: 'Botaniker',
      icon: '🔬🌱',
      desc: '30+ Sorten probiert',
      color: 'from-green-600 to-teal-600',
      category: 'Sorten'
    });

    // ☀️ FRÜHAUFSTEHER (Morgensessions vor 10 Uhr) - 4 Stufen
    if (stats.earlyBirdSessions >= 5) earned.push({
      name: 'Morgenmuffel',
      icon: '🌅',
      desc: '5+ Morgensessions',
      color: 'from-orange-400 to-yellow-400',
      category: 'Frühaufsteher'
    });
    if (stats.earlyBirdSessions >= 15) earned.push({
      name: 'Frühaufsteher',
      icon: '☕',
      desc: '15+ Morgensessions',
      color: 'from-yellow-500 to-orange-500',
      category: 'Frühaufsteher'
    });
    if (stats.earlyBirdSessions >= 30) earned.push({
      name: 'Morgenröte',
      icon: '🌄',
      desc: '30+ Morgensessions',
      color: 'from-pink-400 to-orange-400',
      category: 'Frühaufsteher'
    });
    if (stats.earlyBirdSessions >= 50) earned.push({
      name: 'Sonnenanbeter',
      icon: '☀️',
      desc: '50+ Morgensessions',
      color: 'from-yellow-400 to-orange-600',
      category: 'Frühaufsteher'
    });

    // 🌙 NACHTEULE (Nachtsessions nach 22 Uhr) - 4 Stufen
    if (stats.nightOwlSessions >= 5) earned.push({
      name: 'Nachtaktiv',
      icon: '🌙',
      desc: '5+ Nachtsessions',
      color: 'from-indigo-500 to-purple-500',
      category: 'Nachteule'
    });
    if (stats.nightOwlSessions >= 15) earned.push({
      name: 'Nachteule',
      icon: '🦉',
      desc: '15+ Nachtsessions',
      color: 'from-purple-500 to-pink-500',
      category: 'Nachteule'
    });
    if (stats.nightOwlSessions >= 30) earned.push({
      name: 'Mitternachtskrieger',
      icon: '🌃',
      desc: '30+ Nachtsessions',
      color: 'from-blue-600 to-purple-600',
      category: 'Nachteule'
    });
    if (stats.nightOwlSessions >= 50) earned.push({
      name: 'Vampir',
      icon: '🧛',
      desc: '50+ Nachtsessions',
      color: 'from-red-600 to-purple-700',
      category: 'Nachteule'
    });

    // 📊 EFFIZIENZ (Ø Hits pro Session) - 4 Stufen
    if (stats.efficiency >= 2.0) earned.push({
      name: 'Effizient',
      icon: '📈',
      desc: 'Ø 2+ Hits/Session',
      color: 'from-blue-400 to-cyan-400',
      category: 'Effizienz'
    });
    if (stats.efficiency >= 3.0) earned.push({
      name: 'Produktiv',
      icon: '⚡',
      desc: 'Ø 3+ Hits/Session',
      color: 'from-green-500 to-teal-500',
      category: 'Effizienz'
    });
    if (stats.efficiency >= 4.0) earned.push({
      name: 'Optimiert',
      icon: '🎯',
      desc: 'Ø 4+ Hits/Session',
      color: 'from-yellow-500 to-orange-500',
      category: 'Effizienz'
    });
    if (stats.efficiency >= 5.0) earned.push({
      name: 'Perfektion',
      icon: '💯',
      desc: 'Ø 5+ Hits/Session',
      color: 'from-purple-500 to-pink-500',
      category: 'Effizienz'
    });

    return earned;
  }, [stats]);

  // Fortschritts-Badges (8 Kategorien)
  const progressBadges = useMemo(() => [
    {
      name: 'Sitzungen',
      icon: Flame,
      current: stats.totalSessions,
      target: getNextTarget(stats.totalSessions, [1, 10, 50, 100, 250, 500, 1000]),
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Streak',
      icon: Calendar,
      current: stats.currentStreak,
      target: getNextTarget(stats.currentStreak, [3, 7, 14, 30, 60, 100]),
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Tages-Rekord',
      icon: Star,
      current: stats.dailyRecord,
      target: getNextTarget(stats.dailyRecord, [5, 10, 15, 20, 25, 30]),
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      name: 'Ausgaben',
      icon: Coins,
      current: Math.round(stats.totalSpending),
      target: getNextTarget(stats.totalSpending, [50, 200, 500, 1000, 2000]),
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      suffix: '€'
    },
    {
      name: 'Sorten',
      icon: Sparkles,
      current: stats.uniqueStrains,
      target: getNextTarget(stats.uniqueStrains, [3, 5, 10, 15, 20, 30]),
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Frühaufsteher',
      icon: Coffee,
      current: stats.earlyBirdSessions,
      target: getNextTarget(stats.earlyBirdSessions, [5, 15, 30, 50]),
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'Nachteule',
      icon: Moon,
      current: stats.nightOwlSessions,
      target: getNextTarget(stats.nightOwlSessions, [5, 15, 30, 50]),
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Effizienz',
      icon: TrendingUp,
      current: stats.efficiency,
      target: getNextTarget(stats.efficiency, [2, 3, 4, 5]),
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
      suffix: ' Ø'
    }
  ], [stats]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            Erfolge
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {medals.length} Medaillen verdient • {progressBadges.length} Kategorien
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{medals.length}</div>
          <div className="text-xs text-zinc-500 uppercase">Medaillen</div>
        </div>
      </div>

      {/* Medaillen Grid */}
      {medals.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-yellow-400 uppercase mb-4 flex items-center gap-2">
            <Medal size={16} />
            Verdiente Medaillen
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {medals.map((medal, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${medal.color} border border-white/10 rounded-xl p-4 text-center transition-all hover:scale-105`}
              >
                <div className="text-4xl mb-2">{medal.icon}</div>
                <div className="text-sm font-bold text-white">{medal.name}</div>
                <div className="text-xs text-white/60 mt-1">{medal.desc}</div>
                <div className="text-[10px] text-white/40 mt-1 uppercase">{medal.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Übersicht */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
          <Star size={16} />
          Deine Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.totalSessions}</div>
            <div className="text-xs text-zinc-600 mt-1">Sessions</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.currentStreak}</div>
            <div className="text-xs text-zinc-600 mt-1">Streak</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.dailyRecord}</div>
            <div className="text-xs text-zinc-600 mt-1">Tages-Rekord</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.uniqueStrains}</div>
            <div className="text-xs text-zinc-600 mt-1">Sorten</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.totalSpending.toFixed(0)}€</div>
            <div className="text-xs text-zinc-600 mt-1">Ausgaben</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.earlyBirdSessions}</div>
            <div className="text-xs text-zinc-600 mt-1">Morgen</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">{stats.nightOwlSessions}</div>
            <div className="text-xs text-zinc-600 mt-1">Nacht</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{stats.efficiency.toFixed(1)}</div>
            <div className="text-xs text-zinc-600 mt-1">Ø Hits/Session</div>
          </div>
        </div>
      </div>

      {/* Fortschritts-Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {progressBadges.map((badge) => {
          const IconComponent = badge.icon;
          const progress = badge.target > 0
            ? Math.min(100, Math.round((badge.current / badge.target) * 100))
            : 100;
          const remaining = Math.max(0, badge.target - badge.current);

          return (
            <div
              key={badge.name}
              className={`bg-gradient-to-br ${badge.gradient} border border-white/10 rounded-2xl p-6 transition-all hover:scale-[1.02]`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <IconComponent size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{badge.name}</h4>
                  <p className="text-xs text-white/60">
                    {badge.current}{badge.suffix || ''} / {badge.target}{badge.suffix || ''}
                  </p>
                </div>
                {progress >= 100 && (
                  <Crown size={20} className="text-yellow-300" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>Fortschritt</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/30 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {remaining > 0 && (
                  <div className="text-xs text-white/60 text-right">
                    noch {remaining.toFixed(badge.suffix ? 1 : 0)}{badge.suffix || ''} verbleibend
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Award size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            <span className="font-bold text-white">Erfolge v2.0:</span> 8 Kategorien, 30+ Medaillen
            mit lustigen Bezeichnungen! Tracke Sitzungen, Streaks, Tagesrekorde, Ausgaben, Sorten,
            Morgen-/Nachtsessions und Effizienz. Deine Erfolge werden automatisch freigeschaltet! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

// Hilfsfunktion: Normalisiere Datum zu Mitternacht
function normalizeToMidnight(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

// Hilfsfunktion: Berechne Streak
function calculateStreak(historyData) {
  if (!Array.isArray(historyData) || historyData.length === 0) return 0;

  try {
    const today = normalizeToMidnight(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Normalisiere alle Einträge EINMAL (effizienter + konsistent)
    const normalizedEntries = historyData.map(entry => ({
      originalEntry: entry,
      normalizedDate: normalizeToMidnight(entry.date)
    }));

    // Filter future entries (verwendet normalisierte Dates)
    const validEntries = normalizedEntries.filter(entry =>
      entry.normalizedDate.getTime() <= today.getTime()
    );

    if (validEntries.length === 0) return 0;

    // Sortiere absteigend (verwendet normalisierte Dates - konsistent mit Filter)
    const sorted = [...validEntries].sort((a, b) =>
      b.normalizedDate.getTime() - a.normalizedDate.getTime()
    );

    // Finde das neueste (gültige) Datum
    const latestDate = sorted[0].normalizedDate;

    // Streak ist nur gültig wenn letzter Eintrag heute oder gestern war
    const isToday = latestDate.getTime() === today.getTime();
    const isYesterday = latestDate.getTime() === yesterday.getTime();

    if (!isToday && !isYesterday) {
      return 0; // Streak gebrochen (letzter Eintrag zu alt)
    }

    // Zähle Streak ab dem neuesten Datum rückwärts
    let streak = 0;
    const startDate = latestDate;

    for (let i = 0; i < sorted.length; i++) {
      const entryDate = sorted[i].normalizedDate; // Bereits normalisiert!
      const expectedDate = new Date(startDate);
      expectedDate.setDate(startDate.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (entryDate.getTime() < expectedDate.getTime()) {
        // Entry ist älter als erwartet - keine weiteren Matches möglich (Array ist sortiert)
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('calculateStreak failed', error);
    return 0;
  }
}

// Hilfsfunktion: Finde nächstes Target
function getNextTarget(current, targets) {
  const next = targets.find(t => t > current);
  return next || targets[targets.length - 1] || current;
}

export default AchievementsView;
