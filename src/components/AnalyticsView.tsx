import React, { useMemo } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Activity, Clock, Tag, Calendar, ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';
import {
  calculatePredictions,
  detectAnomalies,
  calculateToleranceIndex,
  analyzeWeekdayPattern,
  calculateHabitScore,
  generateRecommendations
} from '../utils/analyticsCalculations.ts';
import { HistoryDataEntry } from '../utils/historyDataHelpers.ts';
import { Settings } from '../hooks/useHitManagement.ts';

interface AnalyticsViewProps {
  historyData: HistoryDataEntry[];
  settings: Settings;
}

// **FIX v8.8**: Entferne sessionHits - verwende nur historyData als einzige Quelle der Wahrheit
export default function AnalyticsView({ historyData, settings }: AnalyticsViewProps) {

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
  const TrendIcon = ({ trend }: { trend: 'increasing' | 'decreasing' | 'stable' }) => {
    if (trend === 'increasing') return <ArrowUp style={{ color: 'var(--accent-error)' }} size={20} />;
    if (trend === 'decreasing') return <ArrowDown style={{ color: 'var(--accent-success)' }} size={20} />;
    return <Minus style={{ color: 'var(--text-disabled)' }} size={20} />;
  };

  const SeverityBadge = ({ severity }: { severity: 'high' | 'medium' | 'low' }) => {
    const getStyles = () => {
      switch (severity) {
        case 'high':
          return {
            backgroundColor: 'color-mix(in srgb, var(--accent-error) 10%, transparent)',
            color: 'var(--accent-error)',
            borderColor: 'color-mix(in srgb, var(--accent-error) 20%, transparent)',
          };
        case 'medium':
          return {
            backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)',
            color: 'var(--accent-warning)',
            borderColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
          };
        case 'low':
          return {
            backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)',
            color: 'var(--accent-info)',
            borderColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)',
          };
      }
    };
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border" style={getStyles()}>
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
        <div
          className="p-3 rounded-xl border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent-secondary) 20%, transparent)',
          }}
        >
          <Brain style={{ color: 'var(--accent-secondary)' }} size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Advanced Analytics</h2>
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>KI-gestützte Analyse & Empfehlungen</p>
        </div>
      </div>

      {/* 7-TAGE HITS LINIENDIAGRAMM */}
      <div
        className="border rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: 'var(--accent-success)' }} />
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Hits der letzten 7 Tage</h3>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
            Gesamt: {last7DaysData.reduce((sum, d) => sum + d.count, 0)} Hits
          </span>
        </div>

        {/* Line Chart */}
        <div
          className="relative h-48 rounded-xl p-4 border"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs pr-2" style={{ color: 'var(--text-tertiary)' }}>
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
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${height}%`,
                        background: isToday
                          ? 'linear-gradient(to top, var(--accent-success), color-mix(in srgb, var(--accent-success) 80%, white))'
                          : day.count > 0
                          ? 'linear-gradient(to top, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))'
                          : 'var(--bg-tertiary)',
                      }}
                      title={`${day.day}: ${day.count} Hits`}
                    />
                  </div>
                  {/* Value */}
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isToday
                        ? 'var(--accent-success)'
                        : day.count > 0
                        ? 'var(--accent-info)'
                        : 'var(--text-tertiary)',
                    }}
                  >
                    {day.count}
                  </span>
                  {/* Day Label */}
                  <span
                    className={`text-[10px] ${isToday ? 'font-bold' : ''}`}
                    style={{
                      color: isToday ? 'var(--accent-success)' : 'var(--text-disabled)',
                    }}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <span className="text-[10px] uppercase block" style={{ color: 'var(--text-tertiary)' }}>Ø pro Tag</span>
            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {(last7DaysData.reduce((sum, d) => sum + d.count, 0) / 7).toFixed(1)}
            </span>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <span className="text-[10px] uppercase block" style={{ color: 'var(--text-tertiary)' }}>Höchster Tag</span>
            <span className="text-lg font-bold" style={{ color: 'var(--accent-info)' }}>{maxHits}</span>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <span className="text-[10px] uppercase block" style={{ color: 'var(--text-tertiary)' }}>Heute</span>
            <span className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>{last7DaysData[6]?.count || 0}</span>
          </div>
        </div>
      </div>

      {/* ML-BASIERTE PROGNOSEN */}
      <div
        className="border rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} style={{ color: 'var(--accent-info)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>ML-Prognosen</h3>
        </div>

        {predictions.trend === 'insufficient_data' ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Nicht genug Daten für Prognosen. Mindestens 7 Tage benötigt.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trend Indicator */}
            <div
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center gap-3">
                <TrendIcon trend={predictions.trend} />
                <div>
                  <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Trend</span>
                  <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                    {predictions.trend === 'increasing' ? 'Steigend' :
                     predictions.trend === 'decreasing' ? 'Sinkend' : 'Stabil'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{predictions.avgDaily}</span>
                <span className="text-xs block" style={{ color: 'var(--text-disabled)' }}>Ø Hits/Tag</span>
              </div>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <span className="text-xs uppercase block mb-2" style={{ color: 'var(--text-disabled)' }}>7-Tage Prognose</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-info)' }}>{predictions.prediction7d}</span>
                <span className="text-xs block mt-1" style={{ color: 'var(--text-tertiary)' }}>erwartete Hits</span>
              </div>
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <span className="text-xs uppercase block mb-2" style={{ color: 'var(--text-disabled)' }}>30-Tage Prognose</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{predictions.prediction30d}</span>
                <span className="text-xs block mt-1" style={{ color: 'var(--text-tertiary)' }}>erwartete Hits</span>
              </div>
            </div>

            {/* Confidence */}
            <div
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase" style={{ color: 'var(--text-disabled)' }}>Modell-Konfidenz</span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{predictions.confidence}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${predictions.confidence}%`,
                    background: 'linear-gradient(to right, var(--accent-info), var(--accent-secondary))',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOLERANZ-INDEX */}
      {toleranceIndex && (() => {
        // Get color styles based on tolerance level
        const getColorStyles = () => {
          switch (toleranceIndex.colorKey) {
            case 'low':
              return {
                accentColor: 'var(--accent-success)',
                containerBg: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-success) 10%, transparent), var(--bg-secondary))',
                containerBorder: 'color-mix(in srgb, var(--accent-success) 30%, transparent)',
                progressBg: 'linear-gradient(to right, var(--accent-success), color-mix(in srgb, var(--accent-success) 90%, white))',
              };
            case 'medium':
              return {
                accentColor: 'var(--accent-warning)',
                containerBg: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-warning) 10%, transparent), var(--bg-secondary))',
                containerBorder: 'color-mix(in srgb, var(--accent-warning) 30%, transparent)',
                progressBg: 'linear-gradient(to right, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 90%, white))',
              };
            case 'high':
              return {
                accentColor: 'var(--accent-error)',
                containerBg: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-error) 10%, transparent), var(--bg-secondary))',
                containerBorder: 'color-mix(in srgb, var(--accent-error) 30%, transparent)',
                progressBg: 'linear-gradient(to right, var(--accent-error), color-mix(in srgb, var(--accent-error) 90%, white))',
              };
            default:
              return {
                accentColor: 'var(--accent-primary)',
                containerBg: 'var(--bg-secondary)',
                containerBorder: 'var(--border-primary)',
                progressBg: 'var(--accent-primary)',
              };
          }
        };
        const styles = getColorStyles();

        return (
          <div
            className="border rounded-2xl p-6 space-y-4"
            style={{
              background: styles.containerBg,
              borderColor: styles.containerBorder,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: styles.accentColor }} />
              <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Toleranz-Index</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="col-span-2 p-6 rounded-xl border text-center"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="text-6xl font-bold" style={{ color: styles.accentColor }}>
                    {toleranceIndex.index}
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold" style={{ color: styles.accentColor }}>{toleranceIndex.level}</div>
                    <div className="text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>Toleranz-Level</div>
                  </div>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full transition-all rounded-full"
                    style={{
                      width: `${toleranceIndex.index}%`,
                      background: styles.progressBg,
                    }}
                  />
                </div>
              </div>

              <div
                className="p-4 rounded-xl border text-center"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{toleranceIndex.activeDays}/7</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>Aktive Tage</p>
              </div>

              <div
                className="p-4 rounded-xl border text-center"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{toleranceIndex.avgDaily}</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>Ø Hits/Tag</p>
              </div>
            </div>

            <div className="p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-disabled)' }}>
                Der Toleranz-Index berechnet sich aus Nutzungshäufigkeit (40%), täglichem Volumen (40%) und Pausen (20%).
                Niedrige Werte = bessere Wirkung, höhere Werte = möglicherweise erhöhte Toleranz.
              </p>
            </div>
          </div>
        );
      })()}

      {/* **FIX v8.8**: WOCHENENDE VS WERKTAG ANALYSE - Ohne Kosten */}
      <div
        className="border rounded-2xl p-6 space-y-4"
        style={{
          background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-secondary) 10%, transparent), var(--bg-secondary))',
          borderColor: 'color-mix(in srgb, var(--accent-secondary) 30%, transparent)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} style={{ color: 'var(--accent-secondary)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-secondary)' }}>Wochenende vs Werktag</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="text-center mb-3">
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-info)' }}>{weekdayAnalysis.weekday}</p>
              <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>Werktag-Hits</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${weekdayAnalysis.weekdayPercent}%`,
                  background: 'linear-gradient(to right, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))',
                }}
              />
            </div>
            <div className="text-center text-xs">
              <span className="font-bold" style={{ color: 'var(--accent-info)' }}>{weekdayAnalysis.weekdayPercent}%</span>
            </div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="text-center mb-3">
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{weekdayAnalysis.weekend}</p>
              <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>Wochenend-Hits</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${weekdayAnalysis.weekendPercent}%`,
                  background: 'linear-gradient(to right, var(--accent-secondary), color-mix(in srgb, var(--accent-secondary) 80%, white))',
                }}
              />
            </div>
            <div className="text-center text-xs">
              <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>{weekdayAnalysis.weekendPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* HABIT SCORE */}
      {habitScore && (
        <div
          className="border rounded-2xl p-6 space-y-4"
          style={{
            background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-warning) 10%, transparent), var(--bg-secondary))',
            borderColor: 'color-mix(in srgb, var(--accent-warning) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: 'var(--accent-warning)' }} />
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-warning)' }}>Habit Score</h3>
          </div>

          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{habitScore.emoji}</div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent-warning)' }}>{habitScore.score}</p>
                  <p className="text-sm" style={{ color: 'var(--text-disabled)' }}>{habitScore.rating}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>Letzte 14 Tage</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{habitScore.activeDays}/14</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <p className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>{habitScore.currentStreak}</p>
                <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>Aktueller Streak</p>
              </div>
              <div
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <p className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>{habitScore.longestStreak}</p>
                <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>Längster Streak</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 50%, transparent)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-disabled)' }}>
              Der Habit Score kombiniert Konsistenz (30%), Häufigkeit (30%) und Moderation (40%).
              Ausgewogen = gesunde Balance, Sporadisch = geringe Nutzung, Intensiv = hohe Aktivität.
            </p>
          </div>
        </div>
      )}

      {/* ANOMALIE-ERKENNUNG */}
      <div
        className="border rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} style={{ color: 'var(--accent-warning)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Anomalie-Erkennung</h3>
        </div>

        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-sm flex items-center justify-center gap-2" style={{ color: 'var(--accent-success)' }}>
            <Activity size={16} />
            Keine Anomalien erkannt. Alles im normalen Bereich!
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" style={{ color: 'var(--accent-warning)' }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{anomaly.message}</span>
                  </div>
                  <SeverityBadge severity={anomaly.severity} />
                </div>
                {anomaly.date && (
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(anomaly.date).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMPFEHLUNGSSYSTEM */}
      <div
        className="border rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} style={{ color: 'var(--accent-success)' }} />
          <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>KI-Empfehlungen</h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Sammle mehr Daten für personalisierte Empfehlungen.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, idx) => {
              const Icon = rec.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border transition-all group"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-primary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-success) 30%, transparent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--accent-success) 10%, transparent)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-success) 20%, transparent)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-success) 10%, transparent)'}
                    >
                      <Icon size={18} style={{ color: 'var(--accent-success)' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{rec.title}</span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{rec.confidence}%</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-disabled)' }}>{rec.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div
        className="border rounded-xl p-4"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-start gap-3">
          <Brain size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-secondary)' }} />
          <div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Machine Learning Info:</span> Die Analysen basieren auf linearer Regression,
              statistischer Anomalieerkennung (Z-Score) und musterbasierten Empfehlungen. Je mehr Daten gesammelt werden,
              desto präziser werden die Vorhersagen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
