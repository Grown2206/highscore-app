import React, { useMemo } from 'react';
import { Trophy, Award, Star, Medal, Crown, Flame, Calendar, Zap } from 'lucide-react';

/**
 * NEUES ACHIEVEMENTS-SYSTEM
 * Einfach, robust, Mix aus Medaillen & Badges
 */

function AchievementsView({ sessionHits = [], historyData = [], settings = {} }) {
  // Sichere Berechnung der Stats (mit Guards)
  const stats = useMemo(() => {
    try {
      const safeHits = Array.isArray(sessionHits) ? sessionHits : [];
      const safeHistory = Array.isArray(historyData) ? historyData : [];

      return {
        totalSessions: safeHits.length || 0,
        totalHits: safeHistory.reduce((sum, day) => sum + (day?.count || 0), 0),
        dailyRecord: safeHistory.length > 0
          ? Math.max(...safeHistory.map(d => d?.count || 0))
          : 0,
        currentStreak: calculateStreak(safeHistory),
        uniqueStrains: new Set(safeHits.map(h => h?.strain).filter(Boolean)).size || 0,
        totalSpending: safeHits.reduce((sum, h) => sum + (parseFloat(h?.price) || 0), 0)
      };
    } catch (error) {
      console.error('AchievementsView: stats calculation failed', error);
      // Fallback: Leere Stats
      return {
        totalSessions: 0,
        totalHits: 0,
        dailyRecord: 0,
        currentStreak: 0,
        uniqueStrains: 0,
        totalSpending: 0
      };
    }
  }, [sessionHits, historyData]);

  // Medaillen-Definitionen (Einfache Milestones)
  const medals = useMemo(() => {
    const earned = [];

    // Session Medaillen
    if (stats.totalSessions >= 10) earned.push({
      name: 'Erste Schritte',
      icon: '🥉',
      desc: '10 Sessions erreicht',
      color: 'from-amber-600 to-amber-500'
    });
    if (stats.totalSessions >= 50) earned.push({
      name: 'Fortgeschritten',
      icon: '🥈',
      desc: '50 Sessions erreicht',
      color: 'from-zinc-400 to-zinc-300'
    });
    if (stats.totalSessions >= 100) earned.push({
      name: 'Veteran',
      icon: '🥇',
      desc: '100 Sessions erreicht',
      color: 'from-yellow-500 to-yellow-400'
    });

    // Streak Medaillen
    if (stats.currentStreak >= 7) earned.push({
      name: 'Wochenkönig',
      icon: '🔥',
      desc: '7 Tage Streak',
      color: 'from-orange-500 to-red-500'
    });
    if (stats.currentStreak >= 14) earned.push({
      name: 'Unaufhaltsam',
      icon: '⚡',
      desc: '14 Tage Streak',
      color: 'from-purple-500 to-pink-500'
    });

    // Rekord Medaillen
    if (stats.dailyRecord >= 10) earned.push({
      name: 'Party Mode',
      icon: '🎉',
      desc: '10+ Hits an einem Tag',
      color: 'from-pink-500 to-rose-500'
    });

    // Explorer Medaillen
    if (stats.uniqueStrains >= 5) earned.push({
      name: 'Entdecker',
      icon: '🌿',
      desc: '5+ Sorten probiert',
      color: 'from-green-500 to-emerald-500'
    });
    if (stats.uniqueStrains >= 10) earned.push({
      name: 'Kenner',
      icon: '🍃',
      desc: '10+ Sorten probiert',
      color: 'from-emerald-500 to-teal-500'
    });

    return earned;
  }, [stats]);

  // Fortschritts-Badges (Aktuelle Ziele)
  const progressBadges = useMemo(() => [
    {
      name: 'Sessions',
      icon: Flame,
      current: stats.totalSessions,
      target: getNextTarget(stats.totalSessions, [10, 50, 100, 250, 500]),
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Streak',
      icon: Calendar,
      current: stats.currentStreak,
      target: getNextTarget(stats.currentStreak, [3, 7, 14, 30, 60]),
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Tages-Rekord',
      icon: Star,
      current: stats.dailyRecord,
      target: getNextTarget(stats.dailyRecord, [5, 10, 15, 20, 25]),
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      name: 'Sorten',
      icon: Zap,
      current: stats.uniqueStrains,
      target: getNextTarget(stats.uniqueStrains, [3, 5, 10, 15, 20]),
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
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
            {medals.length} Medaillen verdient
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{medals.length}</div>
          <div className="text-xs text-zinc-500 uppercase">Medaillen</div>
        </div>
      </div>

      {/* Medaillen */}
      {medals.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-yellow-400 uppercase mb-4 flex items-center gap-2">
            <Medal size={16} />
            Verdiente Medaillen
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {medals.map((medal, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${medal.color} border border-white/10 rounded-xl p-4 text-center`}
              >
                <div className="text-4xl mb-2">{medal.icon}</div>
                <div className="text-sm font-bold text-white">{medal.name}</div>
                <div className="text-xs text-white/60 mt-1">{medal.desc}</div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <div className="text-2xl font-bold text-blue-400">{stats.totalHits}</div>
            <div className="text-xs text-zinc-600 mt-1">Total Hits</div>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.totalSpending.toFixed(0)}€</div>
            <div className="text-xs text-zinc-600 mt-1">Ausgaben</div>
          </div>
        </div>
      </div>

      {/* Fortschritts-Badges */}
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
              className={`bg-gradient-to-br ${badge.gradient} border border-white/10 rounded-2xl p-6`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <IconComponent size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{badge.name}</h4>
                  <p className="text-xs text-white/60">
                    {badge.current} / {badge.target}
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
                    noch {remaining} verbleibend
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
            <span className="font-bold text-white">Erfolge:</span> Verdiene Medaillen durch Meilensteine
            und tracke deinen Fortschritt mit Badges. Deine Erfolge werden automatisch freigeschaltet!
          </p>
        </div>
      </div>
    </div>
  );
}

// Hilfsfunktion: Berechne Streak
function calculateStreak(historyData) {
  if (!Array.isArray(historyData) || historyData.length === 0) return 0;

  try {
    const sorted = [...historyData].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const entryDate = new Date(sorted[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
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
