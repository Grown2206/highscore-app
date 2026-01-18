import React, { useMemo } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Activity, Clock, Tag, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  calculatePredictions,
  detectAnomalies,
  calculateToleranceIndex,
  analyzeWeekdayPattern,
  calculateHabitScore,
  generateRecommendations
} from '../utils/analyticsCalculations.ts';

// **FIX v8.8**: Entferne sessionHits - verwende nur historyData als einzige Quelle der Wahrheit
export default function AnalyticsView({ historyData, settings }) {

  // --- 1. ML-BASIERTE PROGNOSEN ---
  const predictions = useMemo(() => calculatePredictions(historyData), [historyData]);

  // --- 2. ANOMALIE-ERKENNUNG ---
  const anomalies = useMemo(() => detectAnomalies(historyData), [historyData]);

  // --- 3. TOLERANZ-INDEX ---
  const toleranceIndex = useMemo(() => calculateToleranceIndex(historyData), [historyData]);

  // --- 4. WOCHENENDE VS WERKTAG ANALYSE ---
  const weekdayAnalysis = useMemo(() => analyzeWeekdayPattern(historyData), [historyData]);

  // --- 5. HABIT SCORE ---
  const habitScore = useMemo(() => calculateHabitScore(historyData), [historyData]);

  // --- 6. EMPFEHLUNGSSYSTEM ---
  const recommendations = useMemo(() =>
    generateRecommendations(historyData, { Calendar, Lightbulb, Activity }),
    [historyData]
  );

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

  // --- 7-TAGE CHART DATA ---
  const last7DaysData = useMemo(() => {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = historyData.find(d => d.date === dateStr);
      const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });

      last7Days.push({
        date: dateStr,
        day: dayName,
        count: dayData ? dayData.count : 0
      });
    }

    return last7Days;
  }, [historyData]);

  const maxHits = Math.max(...last7DaysData.map(d => d.count), 1);

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

      {/* 7-TAGE HITS LINIENDIAGRAMM */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Hits der letzten 7 Tage</h3>
          </div>
          <span className="text-xs text-zinc-500">
            Gesamt: {last7DaysData.reduce((sum, d) => sum + d.count, 0)} Hits
          </span>
        </div>

        {/* Line Chart */}
        <div className="relative h-48 bg-zinc-950 rounded-xl p-4 border border-zinc-800">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-zinc-600 pr-2">
            <span>{maxHits}</span>
            <span>{Math.round(maxHits / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart Area */}
          <div className="ml-8 h-full flex items-end justify-between gap-2">
            {last7DaysData.map((day, idx) => {
              const height = maxHits > 0 ? (day.count / maxHits) * 100 : 0;
              const isToday = idx === 6;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '140px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' :
                        day.count > 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400' :
                        'bg-zinc-800'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${day.day}: ${day.count} Hits`}
                    />
                  </div>
                  {/* Value */}
                  <span className={`text-xs font-bold ${
                    isToday ? 'text-emerald-400' :
                    day.count > 0 ? 'text-blue-400' : 'text-zinc-600'
                  }`}>
                    {day.count}
                  </span>
                  {/* Day Label */}
                  <span className={`text-[10px] ${
                    isToday ? 'text-emerald-500 font-bold' : 'text-zinc-500'
                  }`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-600 uppercase block">Ø pro Tag</span>
            <span className="text-lg font-bold text-white">
              {(last7DaysData.reduce((sum, d) => sum + d.count, 0) / 7).toFixed(1)}
            </span>
          </div>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-600 uppercase block">Höchster Tag</span>
            <span className="text-lg font-bold text-blue-400">{maxHits}</span>
          </div>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-600 uppercase block">Heute</span>
            <span className="text-lg font-bold text-emerald-400">{last7DaysData[6]?.count || 0}</span>
          </div>
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

      {/* **FIX v8.8**: WOCHENENDE VS WERKTAG ANALYSE - Ohne Kosten */}
      <div className="bg-gradient-to-br from-violet-900/20 to-zinc-900 border border-violet-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-violet-500"/>
          <h3 className="text-sm font-bold text-violet-400 uppercase">Wochenende vs Werktag</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-blue-400">{weekdayAnalysis.weekday}</p>
              <p className="text-xs text-zinc-600 uppercase mt-1">Werktag-Hits</p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${weekdayAnalysis.weekdayPercent}%` }}
              />
            </div>
            <div className="text-center text-xs">
              <span className="text-cyan-400 font-bold">{weekdayAnalysis.weekdayPercent}%</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-violet-400">{weekdayAnalysis.weekend}</p>
              <p className="text-xs text-zinc-600 uppercase mt-1">Wochenend-Hits</p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                style={{ width: `${weekdayAnalysis.weekendPercent}%` }}
              />
            </div>
            <div className="text-center text-xs">
              <span className="text-violet-400 font-bold">{weekdayAnalysis.weekendPercent}%</span>
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
