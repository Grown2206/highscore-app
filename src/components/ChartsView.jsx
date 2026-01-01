import React, { useMemo, useState } from 'react';
import { Clock, CalendarDays, DollarSign, TrendingUp, BarChart3, Tag, Zap, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { getTotalHits, getAvgHitsPerDay, formatLocalDate, getLastNDays } from '../utils/historyDataHelpers';

// **FIX v8.9**: sessionHits als primäre Quelle - alle Chart-Features wiederhergestellt
// Verwende historyDataHelpers für Aggregationen
export default function ChartsView({ historyData, settings, sessionHits }) {
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 Tage
  const weekStats = useMemo(() => {
     const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
     const counts = Array(7).fill(0);
     historyData.forEach(h => counts[new Date(h.date).getDay()] += h.count);
     return days.map((d,i) => ({ day:d, val:counts[i] }));
  }, [historyData]);
  const maxW = Math.max(...weekStats.map(s=>s.val), 1);

  // **FIX v8.9**: Hourly Distribution wiederhergestellt - nutzt sessionHits timestamps
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

  // Heatmap Data (letzte 12 Wochen)
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

  // **FIX v8.9**: Cost Timeline wiederhergestellt - nutzt sessionHits mit strain prices
  const costTimeline = useMemo(() => {
    const dailyCosts = {};
    sessionHits?.forEach(hit => {
      const dateStr = new Date(hit.timestamp).toISOString().split('T')[0];
      if (!dailyCosts[dateStr]) {
        dailyCosts[dateStr] = 0;
      }
      const hitCost = (hit.strainPrice || 0) * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);
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

  // **FIX v8.9**: Strain Stats wiederhergestellt - nutzt sessionHits mit strain info
  const strainStats = useMemo(() => {
    const strainMap = {};
    sessionHits?.forEach(hit => {
      const strainName = hit.strainName || 'Unbekannt';
      if (!strainMap[strainName]) {
        strainMap[strainName] = { name: strainName, count: 0, cost: 0 };
      }
      strainMap[strainName].count++;
      const hitCost = (hit.strainPrice || 0) * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);
      strainMap[strainName].cost += hitCost;
    });

    return Object.values(strainMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sessionHits, settings]);

  const totalStrainHits = strainStats.reduce((sum, s) => sum + s.count, 0);

  // **FIX v8.9**: Monthly Trend mit Kosten wiederhergestellt
  const monthlyTrend = useMemo(() => {
    const months = {};

    // Aggregiere Hits pro Monat
    historyData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0, cost: 0 };
      }
      months[monthKey].count += day.count;
    });

    // Aggregiere Kosten pro Monat aus sessionHits
    sessionHits?.forEach(hit => {
      const date = new Date(hit.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0, cost: 0 };
      }
      const hitCost = (hit.strainPrice || 0) * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);
      months[monthKey].cost += hitCost;
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [historyData, sessionHits, settings]);

  const maxMonthlyCount = Math.max(...monthlyTrend.map(m => m.count), 1);
  const maxMonthlyCost = Math.max(...monthlyTrend.map(m => m.cost), 1);

  // **FIX v8.8.1**: Verwende historyDataHelpers statt inline reduce/filter
  const totalStats = useMemo(() => {
    const activeDays = historyData.filter(h => h.count > 0).length;
    const totalHits = getTotalHits(historyData);
    const avgPerDay = getAvgHitsPerDay(historyData);
    const totalAmount = totalHits * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);

    return { activeDays, totalHits, avgPerDay, totalAmount };
  }, [historyData, settings]);

  // **FIX v8.9**: Session Duration wiederhergestellt - nutzt sessionHits mit duration
  const durationStats = useMemo(() => {
    const durations = sessionHits?.filter(h => h.duration > 0).map(h => h.duration) || [];
    if (durations.length === 0) return null;

    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    return { total, avg, max, min, count: durations.length };
  }, [sessionHits]);

  // **FIX v8.8.1**: Verwende getLastNDays und lokale Datum-Formatierung
  const comparisonStats = useMemo(() => {
    const last14Days = getLastNDays(historyData, 14);

    // Split in letzte 7 und vorherige 7 Tage
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

  // **FIX v8.9**: Peak Analysis wiederhergestellt - nutzt sessionHits mit timestamps
  const peakAnalysis = useMemo(() => {
    if (!sessionHits || sessionHits.length === 0) return null;

    const peakHours = [18, 19, 20, 21, 22, 23]; // 18:00 - 23:59
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
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-emerald-500" />
          Statistik
        </h2>
      </div>

      {/* Gesamt-Übersicht */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
          <TrendingUp size={16} />
          Gesamt-Übersicht
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-400">{totalStats.totalHits}</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Gesamt Hits</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">{totalStats.activeDays}</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Aktive Tage</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-lime-400">{totalStats.totalAmount.toFixed(1)}g</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Gesamt Menge</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-cyan-400">{totalStats.avgPerDay.toFixed(1)}</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Ø pro Tag</p>
          </div>
        </div>
      </div>

      {/* Comparison Stats - This Week vs Last Week */}
      <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-500"/>
          <h3 className="text-sm font-bold text-blue-400 uppercase">Wochenvergleich</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-500 uppercase mb-2">Letzte 7 Tage</p>
            <p className="text-3xl font-bold text-blue-400">{comparisonStats.last7}</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-500 uppercase mb-2">Vorherige 7 Tage</p>
            <p className="text-3xl font-bold text-purple-400">{comparisonStats.prev7}</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-500 uppercase mb-2">Veränderung</p>
            <div className="flex items-center justify-center gap-2">
              <p className={`text-3xl font-bold ${
                comparisonStats.trend === 'up' ? 'text-rose-400' :
                comparisonStats.trend === 'down' ? 'text-emerald-400' : 'text-zinc-400'
              }`}>
                {comparisonStats.change}%
              </p>
              {comparisonStats.trend === 'up' && <TrendingUp size={20} className="text-rose-400" />}
              {comparisonStats.trend === 'down' && <TrendingDown size={20} className="text-emerald-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* **FIX v8.9**: Session Duration, Peak Analysis und Hourly Distribution wiederhergestellt */}

      {/* Session Duration Stats */}
      {durationStats && (
        <div className="bg-gradient-to-br from-cyan-900/20 to-zinc-900 border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase mb-4 flex items-center gap-2">
            <Clock size={16} />
            Session Dauer (Sensor)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">{durationStats.avg.toFixed(1)}s</p>
              <p className="text-xs text-zinc-600 uppercase mt-2">Ø Dauer</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{durationStats.max}s</p>
              <p className="text-xs text-zinc-600 uppercase mt-2">Längste</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{durationStats.min}s</p>
              <p className="text-xs text-zinc-600 uppercase mt-2">Kürzeste</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{durationStats.count}</p>
              <p className="text-xs text-zinc-600 uppercase mt-2">Sensor Hits</p>
            </div>
          </div>
        </div>
      )}

      {/* Peak vs Off-Peak Analysis */}
      {peakAnalysis && (
        <div className="bg-gradient-to-br from-orange-900/20 to-zinc-900 border border-orange-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-orange-400 uppercase mb-4 flex items-center gap-2">
            <Zap size={16} />
            Peak vs Off-Peak (18:00-23:59)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 rounded-xl">
              <div className="text-center mb-2">
                <p className="text-4xl font-bold text-orange-400">{peakAnalysis.peak}</p>
                <p className="text-xs text-zinc-600 uppercase mt-2">Peak Hits</p>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${peakAnalysis.peakPercentage}%` }}
                ></div>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-2">{peakAnalysis.peakPercentage}%</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl">
              <div className="text-center mb-2">
                <p className="text-4xl font-bold text-blue-400">{peakAnalysis.offPeak}</p>
                <p className="text-xs text-zinc-600 uppercase mt-2">Off-Peak Hits</p>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${peakAnalysis.offPeakPercentage}%` }}
                ></div>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-2">{peakAnalysis.offPeakPercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Distribution */}
      {hourlyDistribution && hourlyDistribution.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-cyan-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Stündliche Verteilung</h3>
          </div>
          <div className="flex justify-between items-end h-32 gap-1 overflow-x-auto">
            {hourlyDistribution.map((h, i) => (
              <div key={i} className="flex-1 min-w-[8px] flex flex-col justify-end items-center gap-2">
                <div
                  className="w-full bg-zinc-800 rounded-t-sm hover:bg-cyan-500/50 transition-colors relative group"
                  style={{ height: `${(h.count / maxHourlyCount) * 100}%` }}
                >
                  {h.count > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {h.hour}: {h.count}
                    </div>
                  )}
                </div>
                {i % 3 === 0 && (
                  <span className="text-[8px] text-zinc-600">{h.hour.split(':')[0]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-2 mb-4"><CalendarDays size={16} className="text-purple-500"/><h3 className="text-sm font-bold text-zinc-400 uppercase">Wochentage</h3></div>
         <div className="flex justify-between items-end h-32 gap-2">
            {weekStats.map(s => (
                <div key={s.day} className="flex-1 flex flex-col justify-end items-center gap-2">
                   <div className="w-full bg-zinc-800 rounded-t-sm hover:bg-purple-500/50 transition-colors relative group" style={{ height: `${(s.val/maxW)*100}%` }}>
                       {s.val > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">{s.val}</div>}
                   </div>
                   <span className="text-[10px] text-zinc-500 uppercase">{s.day}</span>
                </div>
            ))}
         </div>
      </div>

      {/* Monats-Trend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon size={16} className="text-indigo-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Monats-Trend</h3>
          <span className="text-[10px] text-zinc-600 ml-auto">Letzte 6 Monate</span>
        </div>

        {/* **FIX v8.9**: Hits und Kosten anzeigen */}
        {monthlyTrend.length > 0 ? (
          <div className="h-32 flex items-end gap-2">
            {monthlyTrend.map((m, i) => {
              const monthName = new Date(m.month + '-01').toLocaleDateString('de-DE', { month: 'short' });
              const barHeight = Math.max(4, (m.count / maxMonthlyCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-500 hover:to-indigo-300 transition-colors relative group" style={{ height: `${barHeight}%` }}>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {m.count} Hits<br/>
                      {m.cost.toFixed(2)}€
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase">{monthName}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-sm">Noch keine Daten für Monats-Trend vorhanden</p>
            <p className="text-zinc-700 text-xs mt-1">Nutze die App für mindestens einen Monat</p>
          </div>
        )}
      </div>

      {/* **FIX v8.9**: Sorten-Verteilung wiederhergestellt */}
      {strainStats && strainStats.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/20 to-zinc-900 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 flex items-center gap-2">
            <Tag size={16} />
            Sorten-Verteilung (Top 5)
          </h3>
          <div className="space-y-3">
            {strainStats.map((strain, i) => {
              const percentage = totalStrainHits > 0 ? (strain.count / totalStrainHits) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">{strain.name}</span>
                    <span className="text-zinc-500">{strain.count} Hits · {strain.cost.toFixed(2)}€</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-zinc-600 text-right">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Aktivitäts-Heatmap</h3>
          <span className="text-[10px] text-zinc-600 ml-auto">Letzte 12 Wochen</span>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-flow-col gap-1 min-w-max">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="grid grid-rows-7 gap-1">
                {week.map((day, di) => {
                  const intensity = day.count > 0 ? (day.count / maxHeatmapCount) : 0;
                  const bgColor = day.count === 0
                    ? 'bg-zinc-800'
                    : `bg-emerald-500`;
                  const opacity = day.count === 0 ? '' : `opacity-${Math.ceil(intensity * 10) * 10}`;

                  return (
                    <div
                      key={di}
                      className={`w-4 h-4 rounded-sm ${bgColor} ${opacity} hover:ring-2 hover:ring-emerald-400 transition-all group relative cursor-pointer`}
                      style={{ opacity: day.count > 0 ? 0.2 + (intensity * 0.8) : undefined }}
                      title={`${day.date}: ${day.count} Hits`}
                    >
                      <div className="absolute hidden group-hover:block -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">
                        {day.count} Hit{day.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-[10px] text-zinc-600">
          <span>Weniger</span>
          <div className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 opacity-30 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 opacity-60 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 opacity-100 rounded-sm"></div>
          <span>Mehr</span>
        </div>
      </div>

      {/* **FIX v8.9**: Cost Timeline wiederhergestellt */}
      {costTimeline && costTimeline.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-900/20 to-zinc-900 border border-yellow-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-yellow-400 uppercase mb-4 flex items-center gap-2">
            <DollarSign size={16} />
            Kosten-Timeline (30 Tage)
          </h3>
          <div className="h-32 flex items-end gap-1">
            {costTimeline.map((day, i) => {
              const barHeight = Math.max(2, (day.cost / maxDailyCost) * 100);
              const displayDate = new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
              return (
                <div key={i} className="flex-1 min-w-[4px] flex flex-col justify-end items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm hover:from-yellow-500 hover:to-yellow-300 transition-colors relative group"
                    style={{ height: `${barHeight}%` }}
                  >
                    {day.cost > 0 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {displayDate}<br/>
                        {day.cost.toFixed(2)}€ ({day.count} Hits)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-500">
              Gesamt: <span className="text-yellow-400 font-bold">{costTimeline.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}€</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}