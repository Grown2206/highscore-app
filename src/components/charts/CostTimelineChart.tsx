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
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border"
      style={{
        background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-warning) 10%, transparent), var(--bg-secondary))',
        borderColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)' }}
          >
            <Coins size={16} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-warning)' }}>Kosten-Timeline</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Letzte 30 Tage</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold" style={{ color: 'var(--accent-warning)' }}>{avgCost.toFixed(2)}€</div>
            <div className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>Ø/Tag</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: 'var(--accent-warning)' }}>{totalCost.toFixed(2)}€</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gesamt</div>
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
                  <TrendingUp size={8} style={{ color: 'var(--accent-warning)' }} />
                </div>
              )}

              {/* Enhanced tooltip */}
              {day.cost > 0 && (
                <div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 backdrop-blur-sm text-white text-[9px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity border"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--accent-warning) 30%, transparent)',
                  }}
                >
                  <div className="font-bold" style={{ color: 'var(--accent-warning)' }}>{displayDate}</div>
                  <div style={{ color: 'var(--accent-warning)' }}>{day.cost.toFixed(2)}€</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{day.count} Hits</div>
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${barHeight}%`,
                  minHeight: day.cost > 0 ? '4px' : '2px',
                  animationDelay: `${i * 0.02}s`,
                  background: isPeak
                    ? 'linear-gradient(to top, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 80%, white))'
                    : day.cost > 0
                    ? 'linear-gradient(to top, color-mix(in srgb, var(--accent-warning) 70%, transparent), color-mix(in srgb, var(--accent-warning) 50%, transparent))'
                    : 'color-mix(in srgb, var(--bg-tertiary) 30%, transparent)',
                  boxShadow: isPeak ? '0 0 20px color-mix(in srgb, var(--accent-warning) 30%, transparent)' : 'none',
                }}
                role="presentation"
                aria-label={`${displayDate}: ${day.cost.toFixed(2)}€, ${day.count} hits`}
              />
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between text-xs pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ background: 'linear-gradient(to top, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 80%, white))' }}
            ></div>
            <span style={{ color: 'var(--text-tertiary)' }}>Peak Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} style={{ color: 'var(--accent-warning)' }} />
            <span style={{ color: 'var(--text-tertiary)' }}>Überdurchschnittlich</span>
          </div>
        </div>
        <div style={{ color: 'var(--text-tertiary)' }}>
          <span className="font-medium" style={{ color: 'var(--accent-warning)' }}>{daysWithCosts}</span> / {costTimeline.length} Tage aktiv
        </div>
      </div>
    </div>
  );
}
