/**
 * Analytics Calculations - ML-basierte Prognosen und Analysen
 *
 * Alle Berechnungen nutzen historyData als einzige Quelle der Wahrheit.
 */

import { HistoryDataEntry } from './historyDataHelpers';
import { LucideIcon } from 'lucide-react';

// Type Definitions
export interface PredictionResult {
  trend: 'insufficient_data' | 'increasing' | 'decreasing' | 'stable';
  slope?: string;
  prediction7d: number;
  prediction30d: number;
  confidence: number | string;
  avgDaily?: string;
}

export interface Anomaly {
  type: 'spike' | 't_break';
  severity: 'high' | 'medium' | 'low';
  date?: string;
  value: number;
  message: string;
}

export interface ToleranceIndex {
  index: number;
  level: 'Niedrig' | 'Mittel' | 'Hoch';
  colorKey: 'low' | 'medium' | 'high';
  activeDays: number;
  avgDaily: string;
}

export interface WeekdayAnalysis {
  weekday: number;
  weekend: number;
  weekdayPercent: string;
  weekendPercent: string;
}

export interface HabitScore {
  score: number;
  rating: 'Sporadisch' | 'Ausgewogen' | 'Intensiv';
  emoji: string;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Recommendation {
  category: 'pattern' | 'health' | 'tolerance';
  icon?: LucideIcon;
  title: string;
  description: string;
  confidence: number;
}

export interface IconSet {
  Calendar?: LucideIcon;
  Lightbulb?: LucideIcon;
  Activity?: LucideIcon;
}

/**
 * Lineare Regression für Trend-Analyse und Vorhersagen
 * @param historyData - Array of history entries
 * @returns Predictions mit trend, slope, predictions, confidence
 */
export function calculatePredictions(historyData: HistoryDataEntry[]): PredictionResult {
  if (historyData.length < 7) {
    return { trend: 'insufficient_data', prediction7d: 0, prediction30d: 0, confidence: 0 };
  }

  // Lineare Regression für Trend-Analyse
  const sortedData = [...historyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
  let trend: PredictionResult['trend'] = 'stable';
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
}

/**
 * Anomalie-Erkennung für ungewöhnliche Muster
 * @param historyData - Array of history entries
 * @returns Detected anomalies mit type, severity, message
 */
export function detectAnomalies(historyData: HistoryDataEntry[]): Anomaly[] {
  if (historyData.length < 10) {
    return [];
  }

  const detectedAnomalies: Anomaly[] = [];

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

  // 2. Lange Pausen (T-Breaks) - aus historyData berechnen
  const sortedDays = [...historyData].filter(d => d.count > 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let maxBreak = 0;
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1].date);
    const currDate = new Date(sortedDays[i].date);
    const breakDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
    if (breakDays > maxBreak) maxBreak = breakDays;
  }

  if (maxBreak > 2) { // > 2 Tage Pause
    detectedAnomalies.push({
      type: 't_break',
      severity: 'low',
      value: maxBreak,
      message: `Längste Pause: ${maxBreak} Tage - Gut für Toleranz-Reset!`
    });
  }

  return detectedAnomalies.slice(0, 5); // Top 5 Anomalien
}

/**
 * Toleranz-Index Berechnung (0-100)
 * @param historyData - Array of history entries
 * @returns Tolerance index mit level, colorKey, scores
 */
export function calculateToleranceIndex(historyData: HistoryDataEntry[]): ToleranceIndex | null {
  if (historyData.length < 7) return null;

  // Berechne Faktoren für Toleranz-Index
  const last7Days = historyData.slice(-7);
  const activeDays = last7Days.filter(d => d.count > 0).length;
  const avgDaily = last7Days.reduce((sum, d) => sum + d.count, 0) / 7;

  // Index-Berechnung (0-100)
  // Faktoren: Häufigkeit (40%), Menge pro Tag (40%), Pausen (20%)
  const frequencyScore = Math.min(100, (activeDays / 7) * 100);
  const volumeScore = Math.min(100, (avgDaily / 15) * 100); // 15 Hits = 100%
  const pauseScore = frequencyScore; // Mehr Pausen (niedrigerer frequencyScore) = niedrigerer Index

  const index = Math.round((frequencyScore * 0.4) + (volumeScore * 0.4) + (pauseScore * 0.2));

  let level: ToleranceIndex['level'] = 'Niedrig';
  let colorKey: ToleranceIndex['colorKey'] = 'low';
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
    avgDaily: avgDaily.toFixed(1)
  };
}

/**
 * Wochenende vs Werktag Analyse
 * @param historyData - Array of history entries
 * @returns Weekday vs weekend statistics
 */
export function analyzeWeekdayPattern(historyData: HistoryDataEntry[]): WeekdayAnalysis {
  let weekdayHits = 0;
  let weekendHits = 0;

  historyData.forEach(day => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      weekendHits += day.count;
    } else {
      weekdayHits += day.count;
    }
  });

  const total = weekdayHits + weekendHits;
  return {
    weekday: weekdayHits,
    weekend: weekendHits,
    weekdayPercent: total > 0 ? ((weekdayHits / total) * 100).toFixed(0) : '0',
    weekendPercent: total > 0 ? ((weekendHits / total) * 100).toFixed(0) : '0'
  };
}

/**
 * Habit Score Berechnung (0-100)
 * @param historyData - Array of history entries
 * @returns Habit score mit rating, emoji, streaks
 */
export function calculateHabitScore(historyData: HistoryDataEntry[]): HabitScore | null {
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

  let rating: HabitScore['rating'] = 'Ausgewogen';
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
}

/**
 * Empfehlungssystem basierend auf Nutzungsmustern
 * @param historyData - Array of history entries
 * @param icons - Icon components (Calendar, Lightbulb, etc.)
 * @returns Recommendations mit category, icon, title, description
 */
export function generateRecommendations(historyData: HistoryDataEntry[], icons?: IconSet): Recommendation[] {
  const recs: Recommendation[] = [];
  const { Calendar, Lightbulb, Activity } = icons || {};

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

  // Gesundheits-Empfehlung basierend auf Nutzungsfrequenz
  const recentDays = historyData.slice(-7);
  const avgDailyHits = recentDays.reduce((sum, d) => sum + d.count, 0) / 7;

  if (avgDailyHits > 12) {
    recs.push({
      category: 'health',
      icon: Lightbulb,
      title: 'Achtsamkeit fördern',
      description: `Durchschnitt: ${avgDailyHits.toFixed(1)} Hits/Tag. Erwäge Tracking deiner Motivation.`,
      confidence: 65
    });
  }

  // T-Break Empfehlung
  const activeDaysLast30 = historyData.slice(-30).filter(d => d.count > 0).length;
  if (activeDaysLast30 > 25) {
    recs.push({
      category: 'tolerance',
      icon: Activity,
      title: 'Toleranz-Break empfohlen',
      description: `${activeDaysLast30}/30 Tage aktiv. Eine Pause würde deine Toleranz senken.`,
      confidence: 70
    });
  }

  return recs.slice(0, 3); // Top 3 Empfehlungen
}
