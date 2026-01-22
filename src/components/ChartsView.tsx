import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { getTotalHits, getAvgHitsPerDay, getLastNDays, HistoryDataEntry } from '../utils/historyDataHelpers.ts';
import { Hit } from '../hooks/useHitSelection.ts';
import { Settings } from '../hooks/useHitManagement.ts';

// Chart Components
import OverviewStats from './charts/OverviewStats';
import WeekComparisonChart from './charts/WeekComparisonChart';
import SessionDurationChart from './charts/SessionDurationChart';
import PeakAnalysisChart from './charts/PeakAnalysisChart';
import HourlyDistributionChart from './charts/HourlyDistributionChart';
import WeekdayChart from './charts/WeekdayChart';
import MonthlyTrendChart from './charts/MonthlyTrendChart';
import StrainDistributionChart from './charts/StrainDistributionChart';
import ActivityHeatmap from './charts/ActivityHeatmap';
import CostTimelineChart from './charts/CostTimelineChart';

interface ChartsViewProps {
  historyData: HistoryDataEntry[];
  settings: Settings;
  sessionHits: Hit[];
}

/**
 * **REFACTORED v8.1**: Charts View - Separated into sub-components
 * Main orchestrator component that calculates data and passes to chart components
 */
export default function ChartsView({ historyData, settings, sessionHits }: ChartsViewProps) {
  // Weekday Stats
  const weekStats = useMemo(() => {
     const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
     const counts = Array(7).fill(0);
     historyData.forEach(h => counts[new Date(h.date).getDay()] += h.count);
     return days.map((d,i) => ({ day:d, val:counts[i] }));
  }, [historyData]);
  const maxW = Math.max(...weekStats.map(s=>s.val), 1);

  // Hourly Distribution
  const hourlyDistribution = useMemo(() => {
    const hours = Array(24).fill(0);
    sessionHits?.forEach(hit => {
      const hour = new Date(hit.timestamp).getHours();
      hours[hour]++;
    });
    return hours.map((count, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      count
    }));
  }, [sessionHits]);
  const maxHourlyCount = Math.max(...hourlyDistribution.map(h => h.count), 1);

  // Heatmap Data (last 12 weeks)
  const heatmapData = useMemo(() => {
    const weeks = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));

      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];

        const dayData = historyData.find(h => h.date === dateStr);
        const count = dayData?.count || 0;

        days.push({
          date: dateStr,
          count,
          day: date.getDate()
        });
      }
      weeks.push(days);
    }

    return weeks;
  }, [historyData]);
  const maxHeatmapCount = Math.max(...heatmapData.flat().map(d => d.count), 1);

  // Cost Timeline
  const costTimeline = useMemo(() => {
    const dailyCosts = {};
    sessionHits?.forEach(hit => {
      const dateStr = new Date(hit.timestamp).toISOString().split('T')[0];
      if (!dailyCosts[dateStr]) {
        dailyCosts[dateStr] = 0;
      }
      const bowlSize = hit.bowlSize ?? settings?.bowlSize ?? 0.3;
      const weedRatio = hit.weedRatio ?? settings?.weedRatio ?? 80;
      const hitCost = (hit.strainPrice || 0) * bowlSize * (weedRatio / 100);
      dailyCosts[dateStr] += hitCost;
    });

    const last30Days = getLastNDays(historyData, 30);
    return last30Days.map(day => ({
      date: day.date,
      cost: dailyCosts[day.date] || 0,
      count: day.count
    }));
  }, [sessionHits, historyData, settings]);
  const maxDailyCost = Math.max(...costTimeline.map(d => d.cost), 1);

  // Strain Stats
  const strainStats = useMemo(() => {
    const strainMap = {};
    sessionHits?.forEach(hit => {
      const strainName = hit.strainName || 'Unbekannt';
      if (!strainMap[strainName]) {
        strainMap[strainName] = { name: strainName, count: 0, cost: 0 };
      }
      strainMap[strainName].count++;
      const bowlSize = hit.bowlSize ?? settings?.bowlSize ?? 0.3;
      const weedRatio = hit.weedRatio ?? settings?.weedRatio ?? 80;
      const hitCost = (hit.strainPrice || 0) * bowlSize * (weedRatio / 100);
      strainMap[strainName].cost += hitCost;
    });

    return Object.values(strainMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sessionHits, settings]);
  const totalStrainHits = strainStats.reduce((sum, s) => sum + s.count, 0);

  // Monthly Trend
  const monthlyTrend = useMemo(() => {
    const months = {};

    historyData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0, cost: 0 };
      }
      months[monthKey].count += day.count;
    });

    sessionHits?.forEach(hit => {
      const date = new Date(hit.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0, cost: 0 };
      }
      const bowlSize = hit.bowlSize ?? settings?.bowlSize ?? 0.3;
      const weedRatio = hit.weedRatio ?? settings?.weedRatio ?? 80;
      const hitCost = (hit.strainPrice || 0) * bowlSize * (weedRatio / 100);
      months[monthKey].cost += hitCost;
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [historyData, sessionHits, settings]);
  const maxMonthlyCount = Math.max(...monthlyTrend.map(m => m.count), 1);

  // Total Stats
  const totalStats = useMemo(() => {
    const activeDays = historyData.filter(h => h.count > 0).length;
    const totalHits = getTotalHits(historyData);
    const avgPerDay = getAvgHitsPerDay(historyData);
    const totalAmount = totalHits * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);

    return { activeDays, totalHits, avgPerDay, totalAmount };
  }, [historyData, settings]);

  // Session Duration Stats
  const durationStats = useMemo(() => {
    const durations = sessionHits?.filter(h => h.duration > 0 && h.duration <= 8).map(h => h.duration) || [];
    if (durations.length === 0) return null;

    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    return { total, avg, max, min, count: durations.length };
  }, [sessionHits]);

  // Comparison Stats (Week over Week)
  const comparisonStats = useMemo(() => {
    const last14Days = getLastNDays(historyData, 14);
    const last7Days = last14Days.slice(-7).map(d => d.count);
    const prev7Days = last14Days.slice(0, 7).map(d => d.count);

    const last7Total = last7Days.reduce((a, b) => a + b, 0);
    const prev7Total = prev7Days.reduce((a, b) => a + b, 0);
    const change = prev7Total > 0 ? ((last7Total - prev7Total) / prev7Total) * 100 : 0;

    return {
      last7: last7Total,
      prev7: prev7Total,
      change: change.toFixed(1),
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
    };
  }, [historyData]);

  // Peak Analysis
  const peakAnalysis = useMemo(() => {
    if (!sessionHits || sessionHits.length === 0) return null;

    const peakHours = [18, 19, 20, 21, 22, 23];
    let peakCount = 0;
    let offPeakCount = 0;

    sessionHits.forEach(hit => {
      const hour = new Date(hit.timestamp).getHours();
      if (peakHours.includes(hour)) {
        peakCount++;
      } else {
        offPeakCount++;
      }
    });

    const total = peakCount + offPeakCount;
    const peakPercentage = total > 0 ? (peakCount / total) * 100 : 0;
    const offPeakPercentage = total > 0 ? (offPeakCount / total) * 100 : 0;

    return {
      peak: peakCount,
      offPeak: offPeakCount,
      peakPercentage: peakPercentage.toFixed(1),
      offPeakPercentage: offPeakPercentage.toFixed(1)
    };
  }, [sessionHits]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 style={{ color: 'var(--accent-success)' }} />
          Statistik
        </h2>
      </div>

      <OverviewStats totalStats={totalStats} />
      <WeekComparisonChart comparisonStats={comparisonStats} />
      <SessionDurationChart durationStats={durationStats} />
      <PeakAnalysisChart peakAnalysis={peakAnalysis} />
      <HourlyDistributionChart hourlyDistribution={hourlyDistribution} maxHourlyCount={maxHourlyCount} />
      <WeekdayChart weekStats={weekStats} maxW={maxW} />
      <MonthlyTrendChart monthlyTrend={monthlyTrend} maxMonthlyCount={maxMonthlyCount} />
      <StrainDistributionChart strainStats={strainStats} totalStrainHits={totalStrainHits} />
      <ActivityHeatmap heatmapData={heatmapData} maxHeatmapCount={maxHeatmapCount} />
      <CostTimelineChart costTimeline={costTimeline} maxDailyCost={maxDailyCost} />
    </div>
  );
}
