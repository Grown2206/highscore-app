import React, { useMemo, useState } from 'react';
import { Trophy, Award, Star, Medal, Crown, Filter } from 'lucide-react';
import {
  PROGRESS_BADGES,
  generateMedals,
  getNextTarget,
  FAST_SESSION_MS,
  SLOW_SESSION_MS,
  MEDAL_DEFINITIONS
} from '../utils/achievementsConfig';

/**
 * ACHIEVEMENTS-SYSTEM v3.0 - Vereinfacht & Clean
 * - Zeigt nur wichtigste Medaillen (nicht alle 70+)
 * - Kategorie-Filter für bessere Übersicht
 * - Cleanes Design ohne Overload
 */

// Calculate total possible medals from config (static, computed once)
const TOTAL_POSSIBLE_MEDALS = Object.values(MEDAL_DEFINITIONS).reduce((sum, categoryMedals) => {
  return sum + (Array.isArray(categoryMedals) ? categoryMedals.length : 0);
}, 0);

function AchievementsView({ sessionHits = [], historyData = [], settings = {} }) {
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  // Sichere & erweiterte Stats-Berechnung
  const stats = useMemo(() => {
    try {
      const safeHits = Array.isArray(sessionHits) ? sessionHits : [];
      const safeHistory = Array.isArray(historyData) ? historyData : [];

      // Basis-Stats
      // WICHTIG: totalHits = tatsächliche Anzahl erfasster Sessions aus sessionHits
      const totalSessions = safeHits.length || 0;
      const totalHits = safeHits.length || 0;
      const dailyRecord = safeHistory.length > 0
        ? Math.max(...safeHistory.map(d => d?.count || 0))
        : 0;
      const currentStreak = calculateStreak(safeHistory);
      const uniqueStrains = new Set(safeHits.map(h => h?.strainName).filter(Boolean)).size || 0;

      // Ausgaben-Berechnung
      const bowlSize = settings?.bowlSize || 0.3;
      const weedRatio = settings?.weedRatio || 80;
      const totalSpending = safeHits.reduce((sum, h) => {
        const price = parseFloat(h?.strainPrice) || 0;
        return sum + (bowlSize * (weedRatio / 100) * price);
      }, 0);

      // Zeit-basierte Stats (single pass)
      let earlyBirdSessions = 0;
      let nightOwlSessions = 0;
      let weekendSessions = 0;
      let weekdaySessions = 0;
      let speedSessions = 0;
      let slowSessions = 0;

      safeHits.forEach(h => {
        if (!h?.timestamp) return;
        const date = new Date(h.timestamp);
        const hour = date.getHours();
        const day = date.getDay();
        const duration = h?.duration || 0;

        if (hour >= 5 && hour < 10) earlyBirdSessions++;
        if (hour >= 22 || hour < 5) nightOwlSessions++;
        if (day === 0 || day === 6) weekendSessions++;
        else weekdaySessions++;

        if (duration > 0) {
          if (duration < FAST_SESSION_MS) speedSessions++;
          else if (duration > SLOW_SESSION_MS) slowSessions++;
        }
      });

      const efficiency = totalSessions > 0
        ? Math.round((totalHits / totalSessions) * 10) / 10
        : 0;

      return {
        totalSessions,
        totalHits,
        dailyRecord,
        currentStreak,
        uniqueStrains,
        totalSpending: Math.round(totalSpending),
        earlyBirdSessions,
        nightOwlSessions,
        efficiency,
        weekendSessions,
        weekdaySessions,
        speedSessions,
        slowSessions
      };
    } catch (err) {
      console.error('Stats berechnung fehlgeschlagen:', err);
      return {
        totalSessions: 0,
        totalHits: 0,
        dailyRecord: 0,
        currentStreak: 0,
        uniqueStrains: 0,
        totalSpending: 0,
        earlyBirdSessions: 0,
        nightOwlSessions: 0,
        efficiency: 0,
        weekendSessions: 0,
        weekdaySessions: 0,
        speedSessions: 0,
        slowSessions: 0
      };
    }
  }, [sessionHits, historyData, settings]);

  // Generiere Medaillen (nur verdiente)
  const allMedals = useMemo(() => {
    const baseMedals = generateMedals(stats);

    // Nur für Sitzungen-Medaillen können wir akkurate Zeitstempel berechnen
    const safeHits = Array.isArray(sessionHits) ? sessionHits : [];
    const sortedHits = [...safeHits].sort((a, b) => {
      const aTime = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
      const bTime = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();

      // Handle invalid timestamps (NaN) by treating them as Infinity (sort to end)
      const safeATime = Number.isFinite(aTime) ? aTime : Infinity;
      const safeBTime = Number.isFinite(bTime) ? bTime : Infinity;

      return safeATime - safeBTime;
    });

    return baseMedals.map(medal => {
      // Nur für Sitzungen-Kategorie Zeitstempel berechnen
      let achievedAt = null;
      if (medal.category === 'Sitzungen' && medal.threshold <= sortedHits.length) {
        achievedAt = sortedHits[medal.threshold - 1]?.timestamp;
      }

      return {
        ...medal,
        achievedAt
      };
    });
  }, [stats, sessionHits]);

  // Filter Medaillen nach Kategorie
  const filteredMedals = useMemo(() => {
    if (selectedCategory === 'Alle') {
      // Zeige nur die Top 12 neuesten Medaillen (sortiert nach achievedAt)
      return [...allMedals]
        .filter(m => m.achievedAt) // Nur welche mit Zeitstempel
        .sort((a, b) => b.achievedAt - a.achievedAt)
        .slice(0, 12);
    }
    // Kategorie-spezifisch: zeige alle dieser Kategorie
    return allMedals.filter(m => m.category === selectedCategory);
  }, [allMedals, selectedCategory]);

  // Kategorien für Filter
  const categories = useMemo(() => {
    const cats = new Set(allMedals.map(m => m.category));
    return ['Alle', ...Array.from(cats)];
  }, [allMedals]);

  // Gesamtfortschritt - basierend auf allen möglichen Medaillen
  const overallProgress = useMemo(() => {
    const earnedMedals = allMedals.length;
    return TOTAL_POSSIBLE_MEDALS > 0 ? Math.round((earnedMedals / TOTAL_POSSIBLE_MEDALS) * 100) : 0;
  }, [allMedals]);

  // Progress Badges (nächste Ziele)
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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Stats - Kompakt */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl p-6 border border-zinc-700">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Erfolge</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{allMedals.length}</div>
            <div className="text-xs text-zinc-400 mt-1">Medaillen</div>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{overallProgress}%</div>
            <div className="text-xs text-zinc-400 mt-1">Fortschritt</div>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.totalSessions}</div>
            <div className="text-xs text-zinc-400 mt-1">Sitzungen</div>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.currentStreak}</div>
            <div className="text-xs text-zinc-400 mt-1">Streak</div>
          </div>
        </div>
      </div>

      {/* Kategorie Filter */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-zinc-400" />
          <span className="text-sm text-zinc-400">Kategorie:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {cat}
              {cat === 'Alle' && ` (${allMedals.filter(m => m.achievedAt).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Medaillen Grid - Vereinfacht */}
      {filteredMedals.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Medal size={20} className="text-yellow-400" />
            {selectedCategory === 'Alle' ? 'Neueste Medaillen' : `${selectedCategory} Medaillen`}
            <span className="text-sm font-normal text-zinc-500">({filteredMedals.length})</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedals.map((medal, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${medal.color} rounded-xl p-4 text-center border border-white/10 hover:border-white/30 transition-all`}
              >
                <div className="text-4xl mb-2">{medal.icon}</div>
                <div className="text-sm font-bold text-white">{medal.name}</div>
                <div className="text-xs text-white/60 mt-1">{medal.description}</div>

                {/* Zeitstempel nur wenn vorhanden */}
                {medal.achievedAt && (
                  <div className="text-xs text-white/40 mt-2">
                    {new Date(medal.achievedAt).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Tracker - Nächste Ziele */}
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star size={20} className="text-purple-400" />
          Nächste Ziele
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressBadges.slice(0, 6).map((badge, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{badge.label}</div>
                    <div className="text-xs text-zinc-400">
                      {badge.current} / {badge.target}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-purple-400">{badge.progress}%</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                ></div>
              </div>

              {badge.remaining > 0 && (
                <div className="text-xs text-zinc-500 mt-2">
                  Noch {badge.remaining} bis zum Ziel
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Milliseconds in one day (for date calculations)
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Helper: Normalize date to day-start timestamp (local midnight)
// Returns: numeric timestamp (not Date object) for precise comparisons
function normalizeToDayStart(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime(); // Returns number, not Date
}

// Helper: Calculate signed day difference between two timestamps (DST-safe)
// Returns: positive if timestamp1 > timestamp2 (timestamp1 is later), negative otherwise
// Uses calendar date arithmetic at noon to avoid DST boundary issues
function daysDiff(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  // Extract calendar date components
  const noon1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), 12, 0, 0, 0);
  const noon2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), 12, 0, 0, 0);

  // Calculate signed difference at noon to avoid DST transition issues (which happen at 2-3 AM)
  const diffMs = noon1 - noon2; // Preserve sign for directionality
  return Math.round(diffMs / MS_PER_DAY);
}

// Helper: Streak berechnen
function calculateStreak(historyData) {
  if (!Array.isArray(historyData) || historyData.length === 0) return 0;

  const sorted = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sorted.length === 0) return 0;

  // Pre-normalize timestamps to avoid repeated Date object creation
  const todayStart = normalizeToDayStart(new Date());
  const latestDateStart = normalizeToDayStart(sorted[0].date);

  const daysSinceLatest = daysDiff(todayStart, latestDateStart);

  // Streak must start with today or yesterday
  if (daysSinceLatest > 1 || sorted[0].count === 0) {
    return 0;
  }

  // Start counting streak
  let streak = 1;
  let expectedDate = new Date(latestDateStart);

  for (let i = 1; i < sorted.length; i++) {
    // Move expected date back by one calendar day (handles DST correctly)
    expectedDate.setDate(expectedDate.getDate() - 1);
    const expectedTimestamp = normalizeToDayStart(expectedDate);

    const currentTimestamp = normalizeToDayStart(sorted[i].date);

    // Compare numeric timestamps (both are numbers from .getTime(), not Date objects)
    if (currentTimestamp === expectedTimestamp && sorted[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default AchievementsView;
