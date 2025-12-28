import React, { useMemo, useState } from 'react';
import { Trophy, Award, Star, Medal, Crown, Filter } from 'lucide-react';
import {
  PROGRESS_BADGES,
  MEDAL_DEFINITIONS,
  generateMedals,
  getNextTarget,
  FAST_SESSION_MS,
  SLOW_SESSION_MS
} from '../utils/achievementsConfig';

/**
 * ACHIEVEMENTS-SYSTEM v3.0 - Vereinfacht & Clean
 * - Zeigt nur wichtigste Medaillen (nicht alle 70+)
 * - Kategorie-Filter für bessere Übersicht
 * - Cleanes Design ohne Overload
 */

// Sentinel value for invalid timestamps (used for sorting invalid values to end of list)
const INVALID_TIMESTAMP_SENTINEL = -Infinity;

// Maximum number of medals to display in "Alle" category
const MAX_MEDALS = 16;

/**
 * Normalize achievement timestamp for consistent sorting
 *
 * @param {number|string|Date|null|undefined} value - Timestamp to normalize:
 *   - `number`: Unix timestamp in milliseconds (finite numbers only; NaN/±Infinity treated as invalid)
 *   - `string`: ISO date string or any Date-parseable format
 *   - `Date`: JavaScript Date object
 *   - `null`/`undefined`: Treated as invalid
 * @returns {number} Normalized timestamp (ms since epoch) or INVALID_TIMESTAMP_SENTINEL
 *
 * NOTE: All invalid inputs collapse to the same sentinel value (INVALID_TIMESTAMP_SENTINEL).
 * This includes: null, undefined, NaN, Infinity, -Infinity, invalid date strings, etc.
 *
 * If you need to distinguish between different types of invalid inputs (e.g., null vs malformed string),
 * check the value BEFORE calling this function and handle accordingly.
 *
 * Examples:
 *   normalizeAchievementTimestamp(1234567890)      → 1234567890 (valid)
 *   normalizeAchievementTimestamp(null)            → INVALID_TIMESTAMP_SENTINEL
 *   normalizeAchievementTimestamp(undefined)       → INVALID_TIMESTAMP_SENTINEL
 *   normalizeAchievementTimestamp(NaN)             → INVALID_TIMESTAMP_SENTINEL (NaN is type 'number')
 *   normalizeAchievementTimestamp(Infinity)        → INVALID_TIMESTAMP_SENTINEL (±Infinity are type 'number')
 *   normalizeAchievementTimestamp("invalid date")  → INVALID_TIMESTAMP_SENTINEL
 */
function normalizeAchievementTimestamp(value) {
  // Handle null/undefined explicitly before new Date() call
  if (value == null) {
    return INVALID_TIMESTAMP_SENTINEL;
  }

  // Handle numeric values (including NaN, Infinity, -Infinity)
  // Only accept finite numbers as valid timestamps
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : INVALID_TIMESTAMP_SENTINEL;
  }

  // Handle strings and Date objects
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : INVALID_TIMESTAMP_SENTINEL;
}

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
    if (!stats) return [];
    const baseMedals = generateMedals(stats);

    // Nur für Sitzungen-Medaillen können wir akkurate Zeitstempel berechnen
    const safeHits = Array.isArray(sessionHits) ? sessionHits : [];

    // Pre-normalize timestamps (O(n)) to avoid NaN in comparator
    const hitsWithNormalizedTime = safeHits.map(hit => {
      let normalizedTime;

      if (typeof hit.timestamp === 'number') {
        normalizedTime = hit.timestamp;
      } else if (hit.timestamp) {
        const parsed = new Date(hit.timestamp).getTime();
        // Invalid timestamps (NaN) are pushed to end for stable sorting
        normalizedTime = isNaN(parsed) ? Infinity : parsed;
      } else {
        // Missing timestamps go to end
        normalizedTime = Infinity;
      }

      return { ...hit, normalizedTime };
    });

    // Sort by pre-normalized timestamp (efficient O(n log n) with simple numeric comparison)
    // Filter out invalid timestamps (Infinity) to keep only valid sessions
    // NOTE: Sessions without valid timestamps cannot be used for achievement date calculation
    // They are still counted in stats.totalSessions, just excluded from chronological ordering
    const sortedHits = hitsWithNormalizedTime
      .sort((a, b) => a.normalizedTime - b.normalizedTime)
      .filter(hit => hit.normalizedTime !== Infinity);

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
  }, [stats, sessionHits]) || [];  // Defensive fallback: ensure always an array

  // Filter Medaillen nach Kategorie
  const filteredMedals = useMemo(() => {
    if (selectedCategory === 'Alle') {
      // **FIX v8.0**: Zeige ALLE Medaillen, nicht nur die mit Zeitstempel
      // Sortiere: Medaillen MIT Zeitstempel zuerst (neueste), dann ohne
      return [...allMedals]
        .sort((a, b) => {
          // Medaillen mit Zeitstempel kommen zuerst
          if (a.achievedAt && !b.achievedAt) return -1;
          if (!a.achievedAt && b.achievedAt) return 1;

          // Beide haben Zeitstempel → sortiere nach Datum (newest first)
          if (a.achievedAt && b.achievedAt) {
            const tA = normalizeAchievementTimestamp(a.achievedAt);
            const tB = normalizeAchievementTimestamp(b.achievedAt);
            return tB - tA;
          }

          // Beide haben keinen Zeitstempel → sortiere nach Threshold (höher = besser)
          return (b.threshold || 0) - (a.threshold || 0);
        })
        .slice(0, MAX_MEDALS);
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
    // Berechne Gesamtzahl aller möglichen Medaillen aus Config
    const totalPossibleMedals = Object.values(MEDAL_DEFINITIONS).reduce((sum, categoryMedals) => {
      return sum + (Array.isArray(categoryMedals) ? categoryMedals.length : 0);
    }, 0);

    // allMedals enthält nur verdiente Medaillen (von generateMedals)
    const earnedMedals = allMedals.length;

    return totalPossibleMedals > 0 ? Math.round((earnedMedals / totalPossibleMedals) * 100) : 0;
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
              {cat === 'Alle' && ` (${allMedals.length})`}
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
                <div className="text-xs text-white/60 mt-1">{medal.desc}</div>

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

// Helper: Streak berechnen
function calculateStreak(historyData) {
  if (!Array.isArray(historyData) || historyData.length === 0) return 0;

  // Finde nur Einträge mit count > 0
  const validEntries = historyData.filter(d => d && d.date && (d.count || 0) > 0);
  if (validEntries.length === 0) return 0;

  // Normalisiere Datumswerte (ohne Uhrzeit) und validiere
  const normalized = validEntries
    .map(d => {
      const date = new Date(d.date);
      const timestamp = date.getTime();

      // Skip invalid dates
      if (isNaN(timestamp)) {
        return null;
      }

      date.setHours(0, 0, 0, 0);
      return {
        ...d,
        normalizedDate: date,
        normalizedTimestamp: date.getTime()
      };
    })
    .filter(d => d !== null);

  if (normalized.length === 0) return 0;

  // Deduplicate by date (keep only one entry per calendar day)
  // Map: timestamp → entry
  const uniqueDatesMap = new Map();
  normalized.forEach(entry => {
    const ts = entry.normalizedTimestamp;
    // Keep first entry for each unique date (could also merge counts if needed)
    if (!uniqueDatesMap.has(ts)) {
      uniqueDatesMap.set(ts, entry);
    }
  });

  // Convert back to array and sort (neueste zuerst)
  const uniqueDates = Array.from(uniqueDatesMap.values())
    .sort((a, b) => b.normalizedTimestamp - a.normalizedTimestamp);

  // Finde das neueste (gültige) Datum
  const latestDate = uniqueDates[0].normalizedDate;

  // Heute und Gestern (normalisiert)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Streak ist nur gültig wenn letzter Eintrag heute oder gestern war
  const isToday = latestDate.getTime() === today.getTime();
  const isYesterday = latestDate.getTime() === yesterday.getTime();

  if (!isToday && !isYesterday) {
    return 0; // Streak gebrochen (letzter Eintrag zu alt)
  }

  // Zähle aufeinanderfolgende Tage (rückwärts vom neuesten)
  let streak = 1;
  let expectedDate = new Date(latestDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (uniqueDates[i].normalizedDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break; // Lücke gefunden
    }
  }

  return streak;
}

export default AchievementsView;
