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

  // --- 3. EMPFEHLUNGSSYSTEM ---
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
