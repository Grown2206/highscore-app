import React, { useMemo } from 'react';
import { Trophy, Award, Star, Medal, Crown } from 'lucide-react';
import {
  PROGRESS_BADGES,
  generateMedals,
  getNextTarget,
  FAST_SESSION_MS,
  SLOW_SESSION_MS
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
      // WICHTIG: totalHits = tatsächliche Anzahl erfasster Sessions aus sessionHits
      // NICHT historyData verwenden (aggregierte Daten können Diskrepanzen haben)
      const totalSessions = safeHits.length || 0;
      const totalHits = safeHits.length || 0; // FIX: Verwende sessionHits als Quelle der Wahrheit
      const dailyRecord = safeHistory.length > 0
        ? Math.max(...safeHistory.map(d => d?.count || 0))
        : 0;
      const currentStreak = calculateStreak(safeHistory);
      const uniqueStrains = new Set(safeHits.map(h => h?.strainName).filter(Boolean)).size || 0;

      // FIX: Korrekte Ausgaben-Berechnung mit bowlSize & weedRatio
      const bowlSize = settings?.bowlSize || 0.3;
      const weedRatio = settings?.weedRatio || 80;
      const totalSpending = safeHits.reduce((sum, h) => {
        const price = parseFloat(h?.strainPrice) || 0;
        return sum + (bowlSize * (weedRatio / 100) * price);
      }, 0);

      // PERFORMANCE: Single-pass für ALLE Zeit-basierten Stats
      // NOTE: Each element in sessionHits represents one session (1 session = 1 hit in this app's terminology)
      // Therefore, incrementing per element correctly counts sessions, not hits-within-sessions
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
        const day = date.getDay(); // 0 = Sonntag, 6 = Samstag
        const duration = h?.duration || 0;

        // Frühaufsteher: 5-10 Uhr
        if (hour >= 5 && hour < 10) {
          earlyBirdSessions++;
        }
        // Nachteule: 22-5 Uhr
        if (hour >= 22 || hour < 5) {
          nightOwlSessions++;
        }

        // Wochenende vs Werktag
        if (day === 0 || day === 6) {
          weekendSessions++;
        } else {
          weekdaySessions++;
        }

        // Speed Runner vs Genießer
        if (duration > 0) {
          if (duration < FAST_SESSION_MS) {
            speedSessions++;
          } else if (duration > SLOW_SESSION_MS) {
            slowSessions++;
          }
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
        efficiency,
        weekendSessions,
        weekdaySessions,
        speedSessions,
        slowSessions
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
        efficiency: 0,
        weekendSessions: 0,
        weekdaySessions: 0,
        speedSessions: 0,
        slowSessions: 0
      };
    }
  }, [sessionHits, historyData, settings]); // FIX: settings dependency hinzugefügt

  // Generiere Medaillen aus Config mit Timestamps
  const medals = useMemo(() => {
    const baseMedals = generateMedals(stats);

    // Füge achievedAt Timestamps hinzu (geschätzt aus sessionHits)
    // Für Sessions-basierte Achievements können wir den ungefähren Zeitpunkt berechnen
    const safeHits = Array.isArray(sessionHits) ? sessionHits : [];

    // Pre-normalize timestamps once (O(n)) to avoid repeated Date construction in comparator
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
    const sortedHits = hitsWithNormalizedTime
      .sort((a, b) => a.normalizedTime - b.normalizedTime)
      .filter(hit => hit.normalizedTime !== Infinity);

    return baseMedals.map(medal => {
      let achievedAt = null;

      // Schätze Zeitpunkt basierend auf Kategorie
      if (medal.category === 'Sitzungen' && medal.threshold <= sortedHits.length) {
        // Der Zeitstempel des N-ten Hits
        achievedAt = sortedHits[medal.threshold - 1]?.timestamp;
      }

      return {
        ...medal,
        // achievedAt can be null when unknown - downstream consumers MUST handle null
        // (UI conditionally renders with {medal.achievedAt && ...} which is safe)
        achievedAt
      };
    });
  }, [stats, sessionHits]);

  // Generiere Progress-Badges aus Config mit erweiterten Infos
  const progressBadges = useMemo(() => {
    return PROGRESS_BADGES.map(badgeConfig => {
      const current = stats[badgeConfig.key] || 0;
      const target = getNextTarget(current, badgeConfig.targets);
      const progress = target > 0
        ? Math.min(100, Math.round((current / target) * 100))
        : 100;
      const remaining = Math.max(0, target - current);

      // Berechne aktuellen Level (wie viele Targets bereits erreicht)
      const currentLevel = badgeConfig.targets.filter(t => current >= t).length;
      const maxLevel = badgeConfig.targets.length;

      // Finde letzten erreichten Threshold
      const lastAchieved = badgeConfig.targets.filter(t => current >= t).pop();

      return {
        ...badgeConfig,
        current,
        target,
        progress,
        remaining,
        currentLevel,
        maxLevel,
        lastAchieved
      };
    });
  }, [stats]);

  // Format-Helper: Formatiert Zahlen basierend auf decimals-Property
  const formatNumber = (value, decimals = 0) => {
    return value.toFixed(decimals);
  };

  // Berechne Gesamtfortschritt
  const overallProgress = useMemo(() => {
    if (progressBadges.length === 0) return 0;
    const totalProgress = progressBadges.reduce((sum, badge) => sum + badge.progress, 0);
    return Math.round(totalProgress / progressBadges.length);
  }, [progressBadges]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Hero Header mit animierter Trophäe */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-500/30 rounded-3xl p-8">
        {/* Hintergrund-Effekte */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div className="relative">
                <Trophy className="text-yellow-400 animate-bounce" size={40} style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl animate-pulse"></div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Erfolge
              </h2>
            </div>
            <p className="text-sm text-zinc-400 font-medium">
              🎖️ {medals.length} Medaillen verdient • 📊 {progressBadges.length} Kategorien aktiv
            </p>
            <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
              <div className="text-xs text-zinc-500">Gesamt-Fortschritt:</div>
              <div className="text-lg font-bold text-yellow-400">{overallProgress}%</div>
            </div>
          </div>

          {/* Statistik-Cards */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 text-center min-w-[100px] hover:scale-105 transition-transform">
              <div className="text-5xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                {medals.length}
              </div>
              <div className="text-xs text-zinc-400 uppercase font-bold mt-1">Medaillen</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center min-w-[100px] hover:scale-105 transition-transform">
              <div className="text-5xl font-bold bg-gradient-to-br from-purple-300 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                {overallProgress}%
              </div>
              <div className="text-xs text-zinc-400 uppercase font-bold mt-1">Fortschritt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Medaillen Showcase */}
      {medals.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Medal size={20} className="text-yellow-400" />
              Verdiente Medaillen
              <span className="text-sm font-normal text-zinc-500">({medals.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {medals.map((medal, i) => (
              <div
                key={i}
                className="group relative"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Glow-Effekt */}
                <div className={`absolute inset-0 bg-gradient-to-br ${medal.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 rounded-xl`}></div>

                {/* Medal Card - kompakter */}
                <div className={`relative bg-gradient-to-br ${medal.color} border-2 border-white/20 rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 hover:border-white/40 shadow-lg hover:shadow-2xl`}>
                  {/* Shine-Effekt */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>

                  {/* Icon - kleiner */}
                  <div className="relative">
                    <div className="text-3xl mb-2 animate-pulse group-hover:animate-bounce" style={{ animationDuration: '2s' }}>
                      {medal.icon}
                    </div>
                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Text - kompakter */}
                  <div className="text-xs font-bold text-white drop-shadow-md leading-tight">{medal.name}</div>
                  <div className="text-[10px] text-white/70 mt-1 leading-tight line-clamp-2">{medal.desc}</div>

                  {/* Category Badge - kleiner */}
                  <div className="mt-1.5 inline-block">
                    <span className="text-[9px] text-white/50 uppercase font-bold bg-black/20 px-1.5 py-0.5 rounded-full">
                      {medal.category}
                    </span>
                  </div>

                  {/* Timestamp Info - NEU */}
                  {medal.achievedAt && (
                    <div className="mt-1.5 text-[9px] text-white/40">
                      {new Date(medal.achievedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </div>
                  )}

                  {/* Sparkle-Effekt in Ecke */}
                  <div className="absolute top-1.5 right-1.5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse text-sm">✨</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Übersicht - Modernisiert */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        {/* Hintergrund-Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-emerald-500"></div>

        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Star size={20} className="text-yellow-400" />
          Deine Stats
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Session Stats */}
          <div className="group relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-orange-500/40">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {stats.totalSessions}
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Sessions</div>
            </div>
          </div>

          {/* Streak Stats */}
          <div className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-purple-500/40">
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {stats.currentStreak}🔥
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Streak</div>
            </div>
          </div>

          {/* Daily Record */}
          <div className="group relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-yellow-500/40">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {stats.dailyRecord}
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Tages-Rekord</div>
            </div>
          </div>

          {/* Unique Strains */}
          <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-green-500/40">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
                {stats.uniqueStrains}
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Sorten</div>
            </div>
          </div>

          {/* Total Spending */}
          <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-emerald-500/40">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                {stats.totalSpending}€
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Ausgaben</div>
            </div>
          </div>

          {/* Early Bird */}
          <div className="group relative bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-amber-500/40">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {stats.earlyBirdSessions}🌅
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Morgen</div>
            </div>
          </div>

          {/* Night Owl */}
          <div className="group relative bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-indigo-500/40">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
                {stats.nightOwlSessions}🌙
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Nacht</div>
            </div>
          </div>

          {/* Efficiency */}
          <div className="group relative bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-all hover:border-cyan-500/40">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-br from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                {stats.efficiency.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-500 mt-1.5 font-semibold uppercase">Ø Hits/Session</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fortschritts-Badges - Modernisiert mit Circular Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award size={20} className="text-emerald-400" />
          Fortschritts-Tracker
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressBadges.map((badge) => {
            const IconComponent = badge.icon;
            const isComplete = badge.progress >= 100;

            return (
              <div
                key={badge.key}
                className={`group relative overflow-hidden bg-gradient-to-br ${badge.gradient} border-2 ${isComplete ? 'border-yellow-400/50' : 'border-white/10'} rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              >
                {/* Completion Glow */}
                {isComplete && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                        <IconComponent size={24} className="text-white" />
                        {isComplete && (
                          <div className="absolute -top-1 -right-1 text-yellow-300 animate-bounce">✨</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-base">{badge.name}</h4>
                        <p className="text-xs text-white/70 mt-0.5 font-mono">
                          {formatNumber(badge.current, badge.decimals)}{badge.suffix} / {formatNumber(badge.target, badge.decimals)}{badge.suffix}
                        </p>
                        <p className="text-[10px] text-white/50 mt-1">
                          Level {badge.currentLevel}/{badge.maxLevel}
                          {badge.lastAchieved && ` • Letztes Ziel: ${badge.lastAchieved}`}
                        </p>
                      </div>
                    </div>
                    {isComplete && (
                      <Crown size={24} className="text-yellow-400 animate-pulse" />
                    )}
                  </div>

                  {/* Circular Progress Ring */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {/* Background Ring */}
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-white/10"
                        />
                        {/* Progress Ring */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - badge.progress / 100)}`}
                          className={`${isComplete ? 'text-yellow-400' : 'text-white/40'} transition-all duration-1000`}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Percentage Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{badge.progress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar (alternative visual) */}
                    <div className="flex-1">
                      <div className="h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className={`h-full ${isComplete ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-white/40'} transition-all duration-1000 rounded-full`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      {badge.remaining > 0 && (
                        <div className="text-[10px] text-white/60 mt-1.5 text-right font-medium">
                          Noch {formatNumber(badge.remaining, badge.decimals)}{badge.suffix} bis zum Ziel
                        </div>
                      )}
                      {isComplete && (
                        <div className="text-[10px] text-yellow-300 mt-1.5 text-right font-bold">
                          🎉 Ziel erreicht!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner - Modernisiert */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/30">
            <Award size={24} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              Erfolge v2.0 - Dein Fortschritt, visualisiert
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">NEU</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-emerald-400">8 Kategorien</strong> mit über <strong className="text-yellow-400">30 Medaillen</strong>
              {' '}– Tracke Sessions, Streaks, Rekorde, Ausgaben, Sorten, Tageszeiten und Effizienz.
              Deine Erfolge werden automatisch freigeschaltet und mit coolen Animationen gefeiert!
              <span className="inline-block ml-1">🎖️✨🚀</span>
            </p>
          </div>
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
