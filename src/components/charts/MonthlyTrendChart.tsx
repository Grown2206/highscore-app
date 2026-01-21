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
 * Enhanced Monthly Trend Chart Component (v8.2 - Theme Support)
 * Shows hit count and cost trends over last 6 months with peak detection
 */
export default function MonthlyTrendChart({ monthlyTrend, maxMonthlyCount }: MonthlyTrendChartProps) {
  if (monthlyTrend.length === 0) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)' }}
          >
            <CalendarIcon size={16} style={{ color: 'var(--accent-info)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-info)' }}>
              Monats-Trend
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Letzte 6 Monate
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Noch keine Daten für Monats-Trend vorhanden
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Nutze die App für mindestens einen Monat
          </p>
        </div>
      </div>
    );
  }

  // Find peak month
  const peakMonth = monthlyTrend.reduce((max, m) => m.count > max.count ? m : max, monthlyTrend[0]);
  const totalCost = monthlyTrend.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, var(--accent-info) 10%, transparent), var(--bg-secondary))`,
        border: '1px solid color-mix(in srgb, var(--accent-info) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)' }}
          >
            <CalendarIcon size={16} style={{ color: 'var(--accent-info)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-info)' }}>
              Monats-Trend
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Letzte 6 Monate
            </p>
          </div>
        </div>
        {peakMonth && (
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: 'var(--accent-info)' }}>
              {new Date(peakMonth.month + '-01').toLocaleDateString('de-DE', { month: 'short' })}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Peak Month
            </div>
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
                  <TrendingUp size={10} style={{ color: 'var(--accent-info)' }} />
                </div>
              )}

              {/* Hover tooltip */}
              <div
                className="absolute -top-14 left-1/2 -translate-x-1/2 text-[9px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--bg-primary) 90%, transparent)',
                  backdropFilter: 'var(--blur)',
                  color: 'var(--text-primary)',
                  borderColor: 'color-mix(in srgb, var(--accent-info) 30%, transparent)',
                }}
              >
                <div className="font-bold" style={{ color: 'var(--accent-info)' }}>
                  {m.count} Hits
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {m.cost.toFixed(2)}€
                </div>
              </div>

              {/* Bar */}
              <div
                className="w-full rounded-t-lg transition-all duration-300 relative"
                style={{
                  background: isPeak
                    ? 'linear-gradient(to top, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))'
                    : 'linear-gradient(to top, color-mix(in srgb, var(--accent-info) 60%, transparent), color-mix(in srgb, var(--accent-info) 40%, transparent))',
                  boxShadow: isPeak ? 'var(--shadow-glow)' : 'none',
                  height: `${barHeight}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
                role="presentation"
                aria-label={`${monthName}: ${m.count} hits, ${m.cost.toFixed(2)}€`}
              />

              {/* Month label */}
              <span className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {monthName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div
        className="flex items-center justify-between text-xs pt-4 border-t"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ background: 'linear-gradient(to top, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))' }}
            />
            <span style={{ color: 'var(--text-tertiary)' }}>Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} style={{ color: 'var(--accent-info)' }} />
            <span style={{ color: 'var(--text-tertiary)' }}>Überdurchschnittlich</span>
          </div>
        </div>
        <div style={{ color: 'var(--text-tertiary)' }}>
          Gesamt: <span className="font-medium" style={{ color: 'var(--accent-info)' }}>{totalCost.toFixed(2)}€</span>
        </div>
      </div>
    </div>
  );
}
