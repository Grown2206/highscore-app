import React, { useMemo, useState } from 'react';
import { Clock, CalendarDays, DollarSign, TrendingUp, BarChart3, Tag, Zap, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';

export default function ChartsView({ historyData, sessionHits, settings }) {
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 Tage
  const weekStats = useMemo(() => {
     const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
     const counts = Array(7).fill(0);
     historyData.forEach(h => counts[new Date(h.date).getDay()] += h.count);
     return days.map((d,i) => ({ day:d, val:counts[i] }));
  }, [historyData]);
  const maxW = Math.max(...weekStats.map(s=>s.val), 1);

  const hourlyDist = useMemo(() => {
    const dist = Array(24).fill(0);
    sessionHits.forEach(h => dist[new Date(h.timestamp).getHours()]++);
    return dist;
  }, [sessionHits]);
  const maxH = Math.max(...hourlyDist, 1);

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

  // Kosten Timeline (letzte 30 Tage)
  const costTimeline = useMemo(() => {
    const timeline = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = historyData.find(h => h.date === dateStr);
      const dayHits = sessionHits.filter(h => {
        const hitDate = new Date(h.timestamp).toISOString().split('T')[0];
        return hitDate === dateStr;
      });

      let cost = 0;
      if (dayHits.length > 0 && settings) {
        dayHits.forEach(hit => {
          const strain = settings.strains.find(s => s.name === hit.strainName);
          const price = strain?.price || hit.strainPrice || 0;
          cost += (settings.bowlSize * (settings.weedRatio / 100) * price);
        });
      }

      timeline.push({
        date: dateStr,
        cost: cost,
        count: dayData?.count || 0,
        day: date.getDate(),
        month: date.getMonth()
      });
    }

    return timeline;
  }, [historyData, sessionHits, settings]);

  const maxCost = Math.max(...costTimeline.map(d => d.cost), 1);

  // Sorten-Statistiken
  const strainStats = useMemo(() => {
    const stats = {};
    sessionHits.forEach(hit => {
      if (!stats[hit.strainName]) {
        const strain = settings?.strains?.find(s => s.name === hit.strainName);
        stats[hit.strainName] = {
          name: hit.strainName,
          count: 0,
          totalCost: 0,
          strain
        };
      }
      stats[hit.strainName].count++;
      const price = stats[hit.strainName].strain?.price || hit.strainPrice || 0;
      stats[hit.strainName].totalCost += (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100) * price;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [sessionHits, settings]);

  // Monats-Trend
  const monthlyTrend = useMemo(() => {
    const months = {};
    sessionHits.forEach(hit => {
      const date = new Date(hit.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0, cost: 0 };
      }
      months[monthKey].count++;
      const strain = settings?.strains?.find(s => s.name === hit.strainName);
      const price = strain?.price || hit.strainPrice || 0;
      months[monthKey].cost += (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100) * price;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6); // Letzte 6 Monate
  }, [sessionHits, settings]);

  const maxMonthlyCount = Math.max(...monthlyTrend.map(m => m.count), 1);
  const maxMonthlyCost = Math.max(...monthlyTrend.map(m => m.cost), 1);

  // Gesamt-Statistiken
  const totalStats = useMemo(() => {
    const activeDays = historyData.filter(h => h.count > 0).length;
    const totalHits = historyData.reduce((sum, h) => sum + h.count, 0); // FIX: sum + h.count statt nur h.count
    const avgPerDay = activeDays > 0 ? totalHits / activeDays : 0;

    let totalCost = 0;
    sessionHits.forEach(hit => {
      const strain = settings?.strains?.find(s => s.name === hit.strainName);
      const price = strain?.price || hit.strainPrice || 0;
      totalCost += (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100) * price;
    });

    const totalAmount = totalHits * (settings?.bowlSize || 0.3) * ((settings?.weedRatio || 80) / 100);

    return { activeDays, totalHits, avgPerDay, totalCost, totalAmount };
  }, [historyData, sessionHits, settings]);

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
            <p className="text-4xl font-bold text-amber-400">{totalStats.totalCost.toFixed(2)}€</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Gesamt Kosten</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-cyan-400">{totalStats.avgPerDay.toFixed(1)}</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Ø pro Tag</p>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-amber-500"/><h3 className="text-sm font-bold text-zinc-400 uppercase">Tageszeit Aktivität</h3></div>
         <div className="h-32 flex items-end gap-1">
            {hourlyDist.map((count, h) => (
               <div key={h} className="flex-1 bg-zinc-800 hover:bg-amber-500/50 transition-colors rounded-t-sm relative group" style={{ height: `${(count/maxH)*100}%` }}>
                  {h % 6 === 0 && <span className="absolute -bottom-5 left-0 text-[8px] text-zinc-600">{h}h</span>}
                  {count > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">{count}</div>}
               </div>
            ))}
         </div>
      </div>

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

        {monthlyTrend.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hits pro Monat */}
            <div>
              <p className="text-xs text-zinc-600 uppercase font-bold mb-3">Hits</p>
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
            </div>

            {/* Kosten pro Monat */}
            <div>
              <p className="text-xs text-zinc-600 uppercase font-bold mb-3">Kosten</p>
              <div className="h-32 flex items-end gap-2">
                {monthlyTrend.map((m, i) => {
                  const monthName = new Date(m.month + '-01').toLocaleDateString('de-DE', { month: 'short' });
                  const barHeight = Math.max(4, (m.cost / maxMonthlyCost) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-lg hover:from-amber-500 hover:to-yellow-300 transition-colors relative group" style={{ height: `${barHeight}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          {m.cost.toFixed(2)}€
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase">{monthName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-sm">Noch keine Daten für Monats-Trend vorhanden</p>
            <p className="text-zinc-700 text-xs mt-1">Nutze die App für mindestens einen Monat</p>
          </div>
        )}
      </div>

      {/* Sorten-Verteilung */}
      {strainStats.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-purple-500"/>
            <h3 className="text-sm font-bold text-zinc-400 uppercase">Sorten-Verteilung</h3>
          </div>

          <div className="space-y-3">
            {strainStats.slice(0, 10).map((strain, i) => {
              const percentage = (strain.count / sessionHits.length) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-mono text-xs">#{i + 1}</span>
                      <span className="text-white font-medium">{strain.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold text-sm">{strain.count}x</span>
                      <span className="text-amber-400 font-bold text-sm">{strain.totalCost.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600">{percentage.toFixed(1)}% aller Sessions</p>
                </div>
              );
            })}
          </div>

          {strainStats.length > 10 && (
            <p className="text-xs text-zinc-600 text-center mt-4">
              +{strainStats.length - 10} weitere Sorten
            </p>
          )}
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

      {/* Cost Timeline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-yellow-500"/>
          <h3 className="text-sm font-bold text-zinc-400 uppercase">Kosten-Verlauf</h3>
          <span className="text-[10px] text-zinc-600 ml-auto">Letzte 30 Tage</span>
        </div>

        {costTimeline.some(d => d.cost > 0) ? (
          <>
            <div className="h-40 flex items-end gap-0.5 overflow-x-auto">
              {costTimeline.map((day, i) => {
                const barHeight = Math.max(2, (day.cost / maxCost) * 100);
                return (
                  <div key={i} className="flex-1 min-w-[8px] flex flex-col justify-end items-center group relative">
                    <div
                      className="w-full bg-gradient-to-t from-yellow-500 to-amber-500 rounded-t-sm hover:from-yellow-400 hover:to-amber-400 transition-colors"
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {day.cost.toFixed(2)}€<br/>
                        <span className="text-zinc-400">{day.count} Hits</span>
                      </div>
                    </div>
                    {(i === 0 || day.day === 1) && (
                      <span className="text-[8px] text-zinc-600 mt-1">{day.day}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-zinc-950 p-3 rounded-xl text-center">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">Gesamt (30d)</p>
                <p className="text-lg font-bold text-yellow-400">
                  {costTimeline.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}€
                </p>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl text-center">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">Ø pro Tag</p>
                <p className="text-lg font-bold text-amber-400">
                  {(costTimeline.reduce((sum, d) => sum + d.cost, 0) / 30).toFixed(2)}€
                </p>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl text-center">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">Max. Tag</p>
                <p className="text-lg font-bold text-orange-400">
                  {Math.max(...costTimeline.map(d => d.cost)).toFixed(2)}€
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-sm">Noch keine Kostendaten vorhanden</p>
            <p className="text-zinc-700 text-xs mt-1">Starte deine erste Session</p>
          </div>
        )}
      </div>
    </div>
  );
}