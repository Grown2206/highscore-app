import React, { useMemo } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Activity, Clock, Tag, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function AnalyticsView({ historyData, sessionHits, settings }) {

  // --- 1. ML-BASIERTE PROGNOSEN ---
  const predictions = useMemo(() => {
    if (historyData.length < 7) {
      return { trend: 'insufficient_data', prediction7d: 0, prediction30d: 0, confidence: 0 };
    }

    // Lineare Regression für Trend-Analyse
    const sortedData = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentData = sortedData.slice(-30); // Letzte 30 Tage

    // Berechne durchschnittliche tägliche Hits
    const n = recentData.length;
    const xValues = recentData.map((_, i) => i);
    const yValues = recentData.map(d => d.count);

    // Lineare Regression: y = mx + b
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Vorhersage für 7 und 30 Tage
    const prediction7d = Math.max(0, Math.round(slope * (n + 7) + intercept));
    const prediction30d = Math.max(0, Math.round(slope * (n + 30) + intercept));

    // Berechne R² für Konfidenz
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = yValues.reduce((sum, y, i) => sum + Math.pow(y - (slope * i + intercept), 2), 0);
    const r2 = 1 - (ssResidual / ssTotal);
    const confidence = Math.max(0, Math.min(100, r2 * 100));

    // Trend-Bestimmung
    const avgRecent = yValues.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, yValues.length);
    const avgOlder = yValues.slice(0, -7).reduce((a, b) => a + b, 0) / Math.max(1, yValues.length - 7);

    let trend = 'stable';
    if (slope > 0.5) trend = 'increasing';
    else if (slope < -0.5) trend = 'decreasing';

    return {
      trend,
      slope: slope.toFixed(2),
      prediction7d,
      prediction30d,
      confidence: confidence.toFixed(0),
      avgDaily: (sumY / n).toFixed(1)
    };
  }, [historyData]);

  // --- 2. ANOMALIE-ERKENNUNG ---
  const anomalies = useMemo(() => {
    if (sessionHits.length < 10) {
      return [];
    }

    const detectedAnomalies = [];

    // Berechne Statistiken für normale Nutzung
    const hitCounts = historyData.map(d => d.count);
    const mean = hitCounts.reduce((a, b) => a + b, 0) / hitCounts.length;
    const variance = hitCounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hitCounts.length;
    const stdDev = Math.sqrt(variance);

    // 1. Ungewöhnlich hohe Tagesmenge (Z-Score > 2)
    historyData.forEach(day => {
      const zScore = (day.count - mean) / stdDev;
      if (zScore > 2 && day.count > 0) {
        detectedAnomalies.push({
          type: 'spike',
          severity: zScore > 3 ? 'high' : 'medium',
          date: day.date,
          value: day.count,
          message: `Ungewöhnlich hohe Aktivität: ${day.count} Hits (${(zScore * 100).toFixed(0)}% über Durchschnitt)`
        });
      }
    });

    // 2. Nachtaktivität (2:00-6:00 Uhr)
    const nightHits = sessionHits.filter(hit => {
      const hour = new Date(hit.timestamp).getHours();
      return hour >= 2 && hour < 6;
    });

    if (nightHits.length > 3) {
      detectedAnomalies.push({
        type: 'night_activity',
        severity: 'medium',
        value: nightHits.length,
        message: `${nightHits.length} Sessions zwischen 2:00-6:00 Uhr erkannt`
      });
    }

    // 3. Rapid Fire Pattern (mehrere Hits in kurzer Zeit)
    let rapidFireCount = 0;
    for (let i = 1; i < sessionHits.length; i++) {
      const timeDiff = sessionHits[i - 1].timestamp - sessionHits[i].timestamp;
      if (timeDiff < 5 * 60 * 1000) { // < 5 Minuten
        rapidFireCount++;
      }
    }

    if (rapidFireCount > 10) {
      detectedAnomalies.push({
        type: 'rapid_fire',
        severity: 'low',
        value: rapidFireCount,
        message: `${rapidFireCount} Rapid-Fire Sessions erkannt (< 5 Min Abstand)`
      });
    }

    // 4. Lange Pausen (T-Breaks)
    const sortedHits = [...sessionHits].sort((a, b) => a.timestamp - b.timestamp);
    let maxBreak = 0;
    for (let i = 1; i < sortedHits.length; i++) {
      const breakTime = sortedHits[i].timestamp - sortedHits[i - 1].timestamp;
      if (breakTime > maxBreak) maxBreak = breakTime;
    }

    if (maxBreak > 24 * 60 * 60 * 1000) { // > 24 Stunden
      const breakDays = Math.floor(maxBreak / (24 * 60 * 60 * 1000));
      detectedAnomalies.push({
        type: 't_break',
        severity: 'low',
        value: breakDays,
        message: `Längste Pause: ${breakDays} Tage - Gut für Toleranz-Reset!`
      });
    }

    return detectedAnomalies.slice(0, 5); // Top 5 Anomalien
  }, [historyData, sessionHits]);

  // --- 3. TOLERANZ-INDEX ---
  const toleranceIndex = useMemo(() => {
    if (sessionHits.length < 7) return null;

    // Berechne Faktoren für Toleranz-Index
    const last7Days = historyData.slice(-7);
    const activeDays = last7Days.filter(d => d.count > 0).length;
    const avgDaily = last7Days.reduce((sum, d) => sum + d.count, 0) / 7;

    // Berechne Sessions pro Tag
    const dailySessions = {};
    sessionHits.forEach(hit => {
      const dateStr = new Date(hit.timestamp).toISOString().split('T')[0];
      dailySessions[dateStr] = (dailySessions[dateStr] || 0) + 1;
    });

    const sessionsPerDay = Object.values(dailySessions);
    const avgSessionsPerDay = sessionsPerDay.length > 0
      ? sessionsPerDay.reduce((a, b) => a + b, 0) / sessionsPerDay.length
      : 0;

    // Index-Berechnung (0-100)
    // Faktoren: Häufigkeit (40%), Menge pro Tag (40%), Pausen (20%)
    const frequencyScore = Math.min(100, (activeDays / 7) * 100);
    const volumeScore = Math.min(100, (avgDaily / 15) * 100); // 15 Hits = 100%
    const pauseScore = frequencyScore; // Mehr Pausen (niedrigerer frequencyScore) = niedrigerer Index

    const index = Math.round((frequencyScore * 0.4) + (volumeScore * 0.4) + (pauseScore * 0.2));

    let level = 'Niedrig';
    let colorKey = 'low';
    if (index > 70) {
      level = 'Hoch';
      colorKey = 'high';
    } else if (index > 40) {
      level = 'Mittel';
      colorKey = 'medium';
    }

    return {
      index,
      level,
      colorKey,
      activeDays,
      avgDaily: avgDaily.toFixed(1),
      avgSessionsPerDay: avgSessionsPerDay.toFixed(1)
    };
  }, [historyData, sessionHits]);

  // --- 4. WOCHENENDE VS WERKTAG ANALYSE ---
  const weekdayAnalysis = useMemo(() => {
    let weekdayCount = 0;
    let weekendCount = 0;
    let weekdayCost = 0;
    let weekendCost = 0;

    sessionHits.forEach(hit => {
      const day = new Date(hit.timestamp).getDay();
      const isWeekend = day === 0 || day === 6;

      const strain = settings?.strains?.find(s => s.name === hit.strainName);
      const price = strain?.price || hit.strainPrice || 0;
      const cost = (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100) * price;

      if (isWeekend) {
        weekendCount++;
        weekendCost += cost;
      } else {
        weekdayCount++;
        weekdayCost += cost;
      }
    });

    const total = weekdayCount + weekendCount;
    return {
      weekday: weekdayCount,
      weekend: weekendCount,
      weekdayPercent: total > 0 ? ((weekdayCount / total) * 100).toFixed(0) : 0,
      weekendPercent: total > 0 ? ((weekendCount / total) * 100).toFixed(0) : 0,
      weekdayAvg: weekdayCount > 0 ? (weekdayCost / weekdayCount).toFixed(2) : 0,
      weekendAvg: weekendCount > 0 ? (weekendCost / weekendCount).toFixed(2) : 0
    };
  }, [sessionHits, settings]);

  // --- 5. HABIT SCORE ---
  const habitScore = useMemo(() => {
    if (historyData.length < 14) return null;

    const last14Days = historyData.slice(-14);
    const activeDays = last14Days.filter(d => d.count > 0).length;

    // Berechne Konsistenz (Streak-Länge)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = last14Days.length - 1; i >= 0; i--) {
      if (last14Days[i].count > 0) {
        tempStreak++;
        if (i === last14Days.length - 1) currentStreak = tempStreak;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Score-Berechnung (0-100)
    const consistencyScore = Math.min(100, (longestStreak / 14) * 100);
    const frequencyScore = (activeDays / 14) * 100;
    const moderationScore = activeDays < 12 ? 100 : Math.max(0, 100 - ((activeDays - 11) * 20));

    const score = Math.round((consistencyScore * 0.3) + (frequencyScore * 0.3) + (moderationScore * 0.4));

    let rating = 'Ausgewogen';
    let emoji = '✅';
    if (score < 40) {
      rating = 'Sporadisch';
      emoji = '🔵';
    } else if (score > 75) {
      rating = 'Intensiv';
      emoji = '🔥';
    }

    return {
      score,
      rating,
      emoji,
      activeDays,
      currentStreak,
      longestStreak
    };
  }, [historyData]);

  // --- 6. EMPFEHLUNGSSYSTEM ---
  const recommendations = useMemo(() => {
    const recs = [];

    // Analyse: Beste Tageszeit
    const hourlyStats = Array(24).fill(0).map(() => ({ count: 0, totalDuration: 0 }));
    sessionHits.forEach(hit => {
      const hour = new Date(hit.timestamp).getHours();
      hourlyStats[hour].count++;
      hourlyStats[hour].totalDuration += hit.duration || 0;
    });

    const peakHour = hourlyStats.reduce((max, stat, hour) =>
      stat.count > hourlyStats[max].count ? hour : max, 0
    );

    if (hourlyStats[peakHour].count > 0) {
      recs.push({
        category: 'timing',
        icon: Clock,
        title: 'Optimale Zeit',
        description: `Deine produktivste Zeit ist um ${peakHour}:00 Uhr (${hourlyStats[peakHour].count} Sessions)`,
        confidence: 85
      });
    }

    // Sorten-Empfehlung basierend auf Nutzung
    const strainUsage = {};
    sessionHits.forEach(hit => {
      const name = hit.strainName || 'Unbekannt';
      if (!strainUsage[name]) strainUsage[name] = { count: 0, totalDuration: 0 };
      strainUsage[name].count++;
      strainUsage[name].totalDuration += hit.duration || 0;
    });

    const topStrain = Object.entries(strainUsage).sort((a, b) => b[1].count - a[1].count)[0];
    if (topStrain) {
      recs.push({
        category: 'strain',
        icon: Tag,
        title: 'Lieblingssorte',
        description: `${topStrain[0]} ist dein Favorit (${topStrain[1].count} Sessions)`,
        confidence: 90
      });
    }

    // Empfehlung basierend auf Konsistenzmuster
    const last7Days = historyData.slice(-7);
    const consistency = last7Days.filter(d => d.count > 0).length;

    if (consistency >= 5) {
      recs.push({
        category: 'pattern',
        icon: Calendar,
        title: 'Konsistentes Muster',
        description: `Du bist sehr regelmäßig (${consistency}/7 Tage aktiv). Erwäge kürzere Sessions.`,
        confidence: 75
      });
    } else if (consistency <= 2 && last7Days.length === 7) {
      recs.push({
        category: 'pattern',
        icon: Calendar,
        title: 'Gute Selbstkontrolle',
        description: `Du machst regelmäßig Pausen. Deine Toleranz bleibt niedrig!`,
        confidence: 80
      });
    }

    // Kosten-Optimierung
    const totalCost = sessionHits.reduce((sum, hit) => {
      const strain = settings.strains.find(s => s.name === hit.strainName);
      const price = strain?.price || hit.strainPrice || 0;
      return sum + (settings.bowlSize * (settings.weedRatio / 100) * price);
    }, 0);

    const avgCostPerSession = sessionHits.length > 0 ? totalCost / sessionHits.length : 0;
    const cheaperStrains = settings.strains.filter(s => s.price < avgCostPerSession);

    if (cheaperStrains.length > 0 && avgCostPerSession > 2) {
      recs.push({
        category: 'cost',
        icon: TrendingUp,
        title: 'Kosten-Tipp',
        description: `Durchschnitt ${avgCostPerSession.toFixed(2)}€/Session. ${cheaperStrains[0].name} spart ${((avgCostPerSession - cheaperStrains[0].price * settings.bowlSize).toFixed(2))}€`,
        confidence: 70
      });
    }

    // Gesundheits-Empfehlung basierend auf Nutzungsfrequenz
    const recentDays = historyData.slice(-7);
    const avgDailyHits = recentDays.reduce((sum, d) => sum + d.count, 0) / 7;

    if (avgDailyHits > 10) {
      recs.push({
        category: 'health',
        icon: Activity,
        title: 'T-Break Empfehlung',
        description: `Durchschnitt ${avgDailyHits.toFixed(1)} Hits/Tag. Eine Pause könnte deine Toleranz senken.`,
        confidence: 85
      });
    }

    return recs;
  }, [historyData, sessionHits, settings]);

  // Render Helpers
  const TrendIcon = ({ trend }) => {
    if (trend === 'increasing') return <ArrowUp className="text-rose-500" size={20} />;
    if (trend === 'decreasing') return <ArrowDown className="text-emerald-500" size={20} />;
    return <Minus className="text-zinc-500" size={20} />;
  };

  const SeverityBadge = ({ severity }) => {
    const colors = {
      high: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[severity]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
          <Brain className="text-purple-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-xs text-zinc-500">KI-gestützte Analyse & Empfehlungen</p>
        </div>
      </div>

      {/* ML-BASIERTE PROGNOSEN */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">ML-Prognosen</h3>
        </div>

        {predictions.trend === 'insufficient_data' ? (
          <div className="text-center py-8 text-zinc-600 text-sm">
            Nicht genug Daten für Prognosen. Mindestens 7 Tage benötigt.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trend Indicator */}
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <TrendIcon trend={predictions.trend} />
                <div>
                  <span className="text-white font-bold block">Trend</span>
                  <span className="text-xs text-zinc-500">
                    {predictions.trend === 'increasing' ? 'Steigend' :
                     predictions.trend === 'decreasing' ? 'Sinkend' : 'Stabil'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{predictions.avgDaily}</span>
                <span className="text-xs text-zinc-500 block">Ø Hits/Tag</span>
              </div>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase block mb-2">7-Tage Prognose</span>
                <span className="text-2xl font-bold text-blue-400">{predictions.prediction7d}</span>
                <span className="text-xs text-zinc-600 block mt-1">erwartete Hits</span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase block mb-2">30-Tage Prognose</span>
                <span className="text-2xl font-bold text-purple-400">{predictions.prediction30d}</span>
                <span className="text-xs text-zinc-600 block mt-1">erwartete Hits</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 uppercase">Modell-Konfidenz</span>
                <span className="text-sm font-bold text-white">{predictions.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${predictions.confidence}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOLERANZ-INDEX */}
      {toleranceIndex && (() => {
        // Fixed Tailwind class mapping to avoid JIT purge issues
        const colorClasses = {
          low: {
            containerBg: 'bg-gradient-to-br from-emerald-900/20 to-zinc-900',
            containerBorder: 'border-emerald-500/30',
            iconText: 'text-emerald-500',
            valueText: 'text-emerald-400',
            progressBg: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
          },
          medium: {
            containerBg: 'bg-gradient-to-br from-amber-900/20 to-zinc-900',
            containerBorder: 'border-amber-500/30',
            iconText: 'text-amber-500',
            valueText: 'text-amber-400',
            progressBg: 'bg-gradient-to-r from-amber-500 to-amber-600'
          },
          high: {
            containerBg: 'bg-gradient-to-br from-rose-900/20 to-zinc-900',
            containerBorder: 'border-rose-500/30',
            iconText: 'text-rose-500',
            valueText: 'text-rose-400',
            progressBg: 'bg-gradient-to-r from-rose-500 to-rose-600'
          }
        };
        const classes = colorClasses[toleranceIndex.colorKey];

        return (
          <div className={`${classes.containerBg} border ${classes.containerBorder} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className={classes.iconText}/>
              <h3 className="text-sm font-bold text-zinc-400 uppercase">Toleranz-Index</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className={`text-6xl font-bold ${classes.valueText}`}>
                    {toleranceIndex.index}
                  </div>
                  <div className="text-left">
                    <div className={`text-2xl font-bold ${classes.valueText}`}>{toleranceIndex.level}</div>
                    <div className="text-xs text-zinc-600 uppercase">Toleranz-Level</div>
                  </div>
                </div>

                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${classes.progressBg} transition-all rounded-full`}
                    style={{ width: `${toleranceIndex.index}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-white">{toleranceIndex.activeDays}/7</p>
                <p className="text-xs text-zinc-600 uppercase mt-1">Aktive Tage</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-white">{toleranceIndex.avgDaily}</p>
                <p className="text-xs text-zinc-600 uppercase mt-1">Ø Hits/Tag</p>
              </div>
            </div>

            <div className="bg-zinc-950/50 p-3 rounded-xl">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Der Toleranz-Index berechnet sich aus Nutzungshäufigkeit (40%), täglichem Volumen (40%) und Pausen (20%).
                Niedrige Werte = bessere Wirkung, höhere Werte = möglicherweise erhöhte Toleranz.
              </p>
            </div>
          </div>
        );
      })()}

      {/* WOCHENENDE VS WERKTAG ANALYSE */}
      <div className="bg-gradient-to-br from-violet-900/20 to-zinc-900 border border-violet-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-violet-500"/>
          <h3 className="text-sm font-bold text-violet-400 uppercase">Wochenende vs Werktag</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-blue-400">{weekdayAnalysis.weekday}</p>
              <p className="text-xs text-zinc-600 uppercase mt-1">Werktag-Sessions</p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${weekdayAnalysis.weekdayPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{weekdayAnalysis.weekdayPercent}%</span>
              <span className="text-cyan-400 font-bold">Ø {weekdayAnalysis.weekdayAvg}€</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-violet-400">{weekdayAnalysis.weekend}</p>
              <p className="text-xs text-zinc-600 uppercase mt-1">Wochenend-Sessions</p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                style={{ width: `${weekdayAnalysis.weekendPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{weekdayAnalysis.weekendPercent}%</span>
              <span className="text-violet-400 font-bold">Ø {weekdayAnalysis.weekendAvg}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* HABIT SCORE */}
      {habitScore && (
        <div className="bg-gradient-to-br from-pink-900/20 to-zinc-900 border border-pink-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-pink-500"/>
            <h3 className="text-sm font-bold text-pink-400 uppercase">Habit Score</h3>
          </div>

          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{habitScore.emoji}</div>
                <div>
                  <p className="text-3xl font-bold text-pink-400">{habitScore.score}</p>
                  <p className="text-sm text-zinc-500">{habitScore.rating}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-600 uppercase">Letzte 14 Tage</p>
                <p className="text-2xl font-bold text-white">{habitScore.activeDays}/14</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-orange-400">{habitScore.currentStreak}</p>
                <p className="text-[10px] text-zinc-600 uppercase">Aktueller Streak</p>
              </div>
              <div className="bg-zinc-900 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-yellow-400">{habitScore.longestStreak}</p>
                <p className="text-[10px] text-zinc-600 uppercase">Längster Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 p-3 rounded-xl">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Der Habit Score kombiniert Konsistenz (30%), Häufigkeit (30%) und Moderation (40%).
              Ausgewogen = gesunde Balance, Sporadisch = geringe Nutzung, Intensiv = hohe Aktivität.
            </p>
          </div>
        </div>
      )}

      {/* ANOMALIE-ERKENNUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Anomalie-Erkennung</h3>
        </div>

        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-emerald-600 text-sm flex items-center justify-center gap-2">
            <Activity size={16} />
            Keine Anomalien erkannt. Alles im normalen Bereich!
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <div key={idx} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-white">{anomaly.message}</span>
                  </div>
                  <SeverityBadge severity={anomaly.severity} />
                </div>
                {anomaly.date && (
                  <span className="text-xs text-zinc-600">
                    {new Date(anomaly.date).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMPFEHLUNGSSYSTEM */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-yellow-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">KI-Empfehlungen</h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">
            Sammle mehr Daten für personalisierte Empfehlungen.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, idx) => {
              const Icon = rec.icon;
              return (
                <div key={idx} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                      <Icon size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{rec.title}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">{rec.confidence}%</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Brain size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-white">Machine Learning Info:</span> Die Analysen basieren auf linearer Regression,
              statistischer Anomalieerkennung (Z-Score) und musterbasierten Empfehlungen. Je mehr Daten gesammelt werden,
              desto präziser werden die Vorhersagen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
