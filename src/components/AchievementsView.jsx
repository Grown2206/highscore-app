import React, { useMemo } from 'react';
import { Trophy, Award, Star, Medal, Crown } from 'lucide-react';
import {
  PROGRESS_BADGES,
  generateMedals,
  getNextTarget
} from '../utils/achievementsConfig';

/**
 * ACHIEVEMENTS-SYSTEM v2.0
 * Nutzt zentrale Config für alle Medaillen & Badges
 */

function AchievementsView({ sessionHits = [], historyData = [], settings = {} }) {
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
      const uniqueStrains = new Set(safeHits.map(h => h?.strainName).filter(Boolean)).size || 0; // FIX: strainName statt strain

      // FIX: Korrekte Ausgaben-Berechnung mit bowlSize & weedRatio
      const bowlSize = settings?.bowlSize || 0.3;
      const weedRatio = settings?.weedRatio || 80;
      const totalSpending = safeHits.reduce((sum, h) => {
        const price = parseFloat(h?.strainPrice) || 0;
        return sum + (bowlSize * (weedRatio / 100) * price);
      }, 0);

      // PERFORMANCE: Single-pass für earlyBird & nightOwl (statt 2 separate filter-Aufrufe)
      let earlyBirdSessions = 0;
      let nightOwlSessions = 0;

      safeHits.forEach(h => {
        if (!h?.timestamp) return;
        const hour = new Date(h.timestamp).getHours();

        // Frühaufsteher: 5-10 Uhr
        if (hour >= 5 && hour < 10) {
          earlyBirdSessions++;
        }
        // Nachteule: 22-5 Uhr
        if (hour >= 22 || hour < 5) {
          nightOwlSessions++;
        }
      });

      // Effizienz (Ø Hits pro Session) - auf 1 Dezimale gerundet
      const efficiency = totalSessions > 0
        ? Math.round((totalHits / totalSessions) * 10) / 10
        : 0;

      return {
        totalSessions,
        totalHits,
        dailyRecord,
        currentStreak,
        uniqueStrains,
        totalSpending: Math.round(totalSpending), // Konsistent: Integer für Euro
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
  }, [sessionHits, historyData, settings]); // FIX: settings dependency hinzugefügt

  // Generiere Medaillen aus Config
  const medals = useMemo(() => generateMedals(stats), [stats]);

  // Generiere Progress-Badges aus Config
  const progressBadges = useMemo(() => {
    return PROGRESS_BADGES.map(badgeConfig => {
      const current = stats[badgeConfig.key] || 0;
      const target = getNextTarget(current, badgeConfig.targets);
      const progress = target > 0
        ? Math.min(100, Math.round((current / target) * 100))
        : 100;
      const remaining = Math.max(0, target - current);

      return {
        ...badgeConfig,
        current,
        target,
        progress,
        remaining
      };
    });
  }, [stats]);

  // Format-Helper: Formatiert Zahlen basierend auf decimals-Property
  const formatNumber = (value, decimals = 0) => {
    return value.toFixed(decimals);
  };

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
            <div className="text-2xl font-bold text-emerald-400">{stats.totalSpending}€</div>
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

          return (
            <div
              key={badge.key}
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
                    {formatNumber(badge.current, badge.decimals)}{badge.suffix} / {formatNumber(badge.target, badge.decimals)}{badge.suffix}
                  </p>
                </div>
                {badge.progress >= 100 && (
                  <Crown size={20} className="text-yellow-300" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>Fortschritt</span>
                  <span>{badge.progress}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/30 transition-all duration-500"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
                {badge.remaining > 0 && (
                  <div className="text-xs text-white/60 text-right">
                    noch {formatNumber(badge.remaining, badge.decimals)}{badge.suffix} verbleibend
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

export default AchievementsView;
