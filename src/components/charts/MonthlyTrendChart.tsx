import React from 'react';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

interface MonthlyData {
  month: string;
  count: number;
  cost: number;
}

interface MonthlyTrendChartProps {
  monthlyTrend: MonthlyData[];
  maxMonthlyCount: number;
}

/**
 * Enhanced Monthly Trend Chart Component
 * Shows hit count and cost trends over last 6 months with peak detection
 */
export default function MonthlyTrendChart({ monthlyTrend, maxMonthlyCount }: MonthlyTrendChartProps) {
  if (monthlyTrend.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <CalendarIcon size={16} className="text-indigo-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-300 uppercase">Monats-Trend</h3>
            <p className="text-xs text-zinc-500">Letzte 6 Monate</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">Noch keine Daten für Monats-Trend vorhanden</p>
          <p className="text-zinc-700 text-xs mt-1">Nutze die App für mindestens einen Monat</p>
        </div>
      </div>
    );
  }

  // Find peak month
  const peakMonth = monthlyTrend.reduce((max, m) => m.count > max.count ? m : max, monthlyTrend[0]);
  const totalCost = monthlyTrend.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-900/10 to-zinc-900 border border-indigo-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <CalendarIcon size={16} className="text-indigo-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-300 uppercase">Monats-Trend</h3>
            <p className="text-xs text-zinc-500">Letzte 6 Monate</p>
          </div>
        </div>
        {peakMonth && (
          <div className="text-right">
            <div className="text-xl font-bold text-indigo-400">
              {new Date(peakMonth.month + '-01').toLocaleDateString('de-DE', { month: 'short' })}
            </div>
            <div className="text-xs text-zinc-500">Peak Month</div>
          </div>
        )}
      </div>

      <div className="h-40 flex items-end gap-3 mb-6" role="img" aria-label="Monthly trend chart">
        {monthlyTrend.map((m, i) => {
          const monthName = new Date(m.month + '-01').toLocaleDateString('de-DE', { month: 'short' });
          const barHeight = maxMonthlyCount > 0 ? Math.max(4, (m.count / maxMonthlyCount) * 100) : 0;
          const isPeak = peakMonth && m.month === peakMonth.month;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end items-center gap-2 group relative"
            >
              {/* Above average indicator */}
              {m.count > (monthlyTrend.reduce((sum, x) => sum + x.count, 0) / monthlyTrend.length) && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-60">
                  <TrendingUp size={10} className="text-indigo-400"/>
                </div>
              )}

              {/* Hover tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-950/90 backdrop-blur-sm text-white text-[9px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity border border-indigo-500/30">
                <div className="font-bold text-indigo-300">{m.count} Hits</div>
                <div className="text-zinc-400">{m.cost.toFixed(2)}€</div>
              </div>

              {/* Bar */}
              <div
                className={`w-full rounded-t-lg transition-all duration-300 relative ${
                  isPeak
                    ? 'bg-gradient-to-t from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-500/30'
                    : 'bg-gradient-to-t from-indigo-600/60 to-indigo-500/40 hover:from-indigo-500 hover:to-indigo-400'
                }`}
                style={{
                  height: `${barHeight}%`,
                  animationDelay: `${i * 0.1}s`
                }}
                role="presentation"
                aria-label={`${monthName}: ${m.count} hits, ${m.cost.toFixed(2)}€`}
              />

              {/* Month label */}
              <span className="text-[10px] text-zinc-500 uppercase font-medium">{monthName}</span>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between text-xs pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-indigo-500 to-indigo-400"></div>
            <span className="text-zinc-500">Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-indigo-400"/>
            <span className="text-zinc-500">Überdurchschnittlich</span>
          </div>
        </div>
        <div className="text-zinc-500">
          Gesamt: <span className="text-indigo-400 font-medium">{totalCost.toFixed(2)}€</span>
        </div>
      </div>
    </div>
  );
}
