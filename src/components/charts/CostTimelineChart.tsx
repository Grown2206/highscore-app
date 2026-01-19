import React from 'react';
import { DollarSign, TrendingUp, Coins } from 'lucide-react';

interface CostDay {
  date: string;
  cost: number;
  count: number;
}

interface CostTimelineChartProps {
  costTimeline: CostDay[];
  maxDailyCost: number;
}

/**
 * Enhanced Cost Timeline Chart Component
 * Shows daily cost distribution over last 30 days with peak detection
 */
export default function CostTimelineChart({ costTimeline, maxDailyCost }: CostTimelineChartProps) {
  if (!costTimeline || costTimeline.length === 0) return null;

  // Calculate stats
  const totalCost = costTimeline.reduce((sum, d) => sum + d.cost, 0);
  const avgCost = totalCost / costTimeline.length;
  const peakDay = costTimeline.reduce((max, d) => d.cost > max.cost ? d : max, costTimeline[0]);
  const daysWithCosts = costTimeline.filter(d => d.cost > 0).length;

  return (
    <div className="bg-gradient-to-br from-yellow-900/10 to-zinc-900 border border-yellow-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <Coins size={16} className="text-yellow-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-yellow-300 uppercase">Kosten-Timeline</h3>
            <p className="text-xs text-zinc-500">Letzte 30 Tage</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-yellow-400">{avgCost.toFixed(2)}€</div>
            <div className="text-[9px] text-zinc-500">Ø/Tag</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-yellow-400">{totalCost.toFixed(2)}€</div>
            <div className="text-xs text-zinc-500">Gesamt</div>
          </div>
        </div>
      </div>

      <div className="h-40 flex items-end gap-0.5 mb-6" role="img" aria-label="Cost timeline chart">
        {costTimeline.map((day, i) => {
          const barHeight = maxDailyCost > 0 ? Math.max(2, (day.cost / maxDailyCost) * 100) : 0;
          const displayDate = new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
          const isPeak = peakDay && day.date === peakDay.date;
          const isAboveAvg = day.cost > avgCost;

          return (
            <div
              key={i}
              className="flex-1 min-w-[4px] flex flex-col justify-end items-center gap-1 group relative"
            >
              {/* Above average indicator */}
              {isAboveAvg && day.cost > 0 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-50">
                  <TrendingUp size={8} className="text-yellow-400"/>
                </div>
              )}

              {/* Enhanced tooltip */}
              {day.cost > 0 && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-sm border border-yellow-500/30 text-white text-[9px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
                  <div className="font-bold text-yellow-300">{displayDate}</div>
                  <div className="text-yellow-400">{day.cost.toFixed(2)}€</div>
                  <div className="text-zinc-400">{day.count} Hits</div>
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isPeak
                    ? 'bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-500/30'
                    : day.cost > 0
                    ? 'bg-gradient-to-t from-yellow-600/70 to-yellow-500/50 hover:from-yellow-500 hover:to-yellow-400'
                    : 'bg-zinc-800/30'
                }`}
                style={{
                  height: `${barHeight}%`,
                  minHeight: day.cost > 0 ? '4px' : '2px',
                  animationDelay: `${i * 0.02}s`
                }}
                role="presentation"
                aria-label={`${displayDate}: ${day.cost.toFixed(2)}€, ${day.count} hits`}
              />
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between text-xs pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-yellow-500 to-yellow-400"></div>
            <span className="text-zinc-500">Peak Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-yellow-400"/>
            <span className="text-zinc-500">Überdurchschnittlich</span>
          </div>
        </div>
        <div className="text-zinc-500">
          <span className="text-yellow-400 font-medium">{daysWithCosts}</span> / {costTimeline.length} Tage aktiv
        </div>
      </div>
    </div>
  );
}
