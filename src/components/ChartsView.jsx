import React, { useMemo, useState } from 'react';
import { Clock, CalendarDays, DollarSign, TrendingUp, BarChart3, Tag, Zap, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';

// **FIX v8.8**: Entferne sessionHits - verwende nur historyData
export default function ChartsView({ historyData, settings }) {
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 Tage
  const weekStats = useMemo(() => {
     const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
     const counts = Array(7).fill(0);
     historyData.forEach(h => counts[new Date(h.date).getDay()] += h.count);
     return days.map((d,i) => ({ day:d, val:counts[i] }));
  }, [historyData]);
  const maxW = Math.max(...weekStats.map(s=>s.val), 1);

  // **FIX v8.8.1**: Hourly Distribution entfernt (benötigt sessionHits mit timestamps)

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

  // **FIX v8.8.1**: Cost Timeline entfernt (benötigt sessionHits mit strain info)

  // **FIX v8.8.1**: Strain Stats entfernt (benötigt sessionHits mit strain info)

  // **FIX v8.8.1**: Monthly Trend mit historyData (ohne Kosten)
  const monthlyTrend = useMemo(() => {
    const months = {};
    historyData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0 };
      }
      months[monthKey].count += day.count;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [historyData]);

  const maxMonthlyCount = Math.max(...monthlyTrend.map(m => m.count), 1);

  // **FIX v8.8**: Gesamt-Statistiken nur mit historyData (keine Kosten mehr)
  const totalStats = useMemo(() => {
    const activeDays = historyData.filter(h => h.count > 0).length;
    const totalHits = historyData.reduce((sum, day) => sum + day.count, 0);
    const avgPerDay = activeDays > 0 ? totalHits / activeDays : 0;
    const totalAmount = totalHits * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);

    return { activeDays, totalHits, avgPerDay, totalAmount };
  }, [historyData, settings]);

  // **FIX v8.8**: Session Duration - Entfernt (benötigt sessionHits mit duration)
  const durationStats = null;

  // Comparison Stats (Last 7 days vs Previous 7 days)
  const comparisonStats = useMemo(() => {
    const today = new Date();
    const last7Days = [];
    const prev7Days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = historyData.find(h => h.date === dateStr);
      last7Days.push(dayData?.count || 0);
    }

    for (let i = 7; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = historyData.find(h => h.date === dateStr);
      prev7Days.push(dayData?.count || 0);
    }

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

  // **FIX v8.8.1**: Peak Analysis entfernt (benötigt sessionHits mit timestamps)

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

      {/* **FIX v8.8.1**: Session Duration, Peak Analysis und Hourly Distribution entfernt */}

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

        {/* **FIX v8.8.1**: Nur Hits anzeigen, keine Kosten mehr */}
        {monthlyTrend.length > 0 ? (
          <div className="h-32 flex items-end gap-2">
            {monthlyTrend.map((m, i) => {
              const monthName = new Date(m.month + '-01').toLocaleDateString('de-DE', { month: 'short' });
              const barHeight = Math.max(4, (m.count / maxMonthlyCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-500 hover:to-indigo-300 transition-colors relative group" style={{ height: `${barHeight}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {m.count} Hits
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

      {/* **FIX v8.8.1**: Sorten-Verteilung entfernt (benötigt sessionHits mit strain info) */}

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

      {/* **FIX v8.8.1**: Cost Timeline entfernt (benötigt sessionHits mit strain info) */}
    </div>
  );
}