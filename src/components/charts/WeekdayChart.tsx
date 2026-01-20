import React from 'react';
import { CalendarDays, TrendingUp } from 'lucide-react';
import ChartCard from './ChartCard';

interface WeekdayData {
  day: string;
  val: number;
}

interface WeekdayChartProps {
  weekStats: WeekdayData[];
  maxW: number;
}

/**
 * Enhanced Weekday Distribution Chart Component (v8.2 - Theme Support)
 * Shows hit distribution across days of the week with weekend highlighting
 */
export default function WeekdayChart({ weekStats, maxW }: WeekdayChartProps) {
  // Calculate total and average
  const total = weekStats.reduce((sum, s) => sum + s.val, 0);
  const avg = total / weekStats.length;

  // Find peak day
  const peakDay = weekStats.reduce((max, s) => s.val > max.val ? s : max, weekStats[0]);

  const headerRight = peakDay ? (
    <div className="text-right">
      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
        {peakDay.day}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Top Day
      </div>
    </div>
  ) : undefined;

  return (
    <ChartCard
      title="Wochentage"
      subtitle="Verteilung nach Wochentag"
      icon={CalendarDays}
      headerRight={headerRight}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex justify-between items-end h-40 gap-2 mb-6" role="img" aria-label="Weekday distribution chart">
        {weekStats.map((s, idx) => {
          const heightPercent = maxW > 0 ? (s.val / maxW) * 100 : 0;
          const isWeekend = s.day === 'So' || s.day === 'Sa';
          const isPeak = peakDay && s.day === peakDay.day;
          const isAboveAvg = s.val > avg;

          // Theme-aware bar styles
          const getBarStyle = () => {
            if (isPeak) {
              return {
                background: 'linear-gradient(180deg, var(--chart-primary), var(--chart-secondary))',
                boxShadow: 'var(--shadow-glow)',
              };
            }
            if (isWeekend) {
              return {
                background: 'linear-gradient(180deg, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 40%, transparent))',
              };
            }
            if (s.val > 0) {
              return {
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--chart-primary) 60%, transparent), color-mix(in srgb, var(--chart-secondary) 40%, transparent))',
              };
            }
            return {
              backgroundColor: 'var(--bg-tertiary)',
              opacity: 0.3,
            };
          };

          return (
            <div
              key={s.day}
              className="flex-1 flex flex-col justify-end items-center gap-2 group relative"
            >
              {/* Value label on hover */}
              {s.val > 0 && (
                <div
                  className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-medium mb-1"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {s.val}
                </div>
              )}

              {/* Above average indicator */}
              {isAboveAvg && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-60">
                  <TrendingUp size={10} style={{ color: 'var(--accent-primary)' }} />
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-t transition-all duration-300 hover:scale-105"
                style={{
                  ...getBarStyle(),
                  height: `${heightPercent}%`,
                  minHeight: s.val > 0 ? '8px' : '4px',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                }}
                role="presentation"
                aria-label={`${s.day}: ${s.val} hits`}
              />

              {/* Day label */}
              <span
                className="text-[11px] uppercase font-medium"
                style={{
                  color: isWeekend ? 'var(--accent-warning)' : 'var(--text-tertiary)',
                }}
              >
                {s.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{
                background: 'linear-gradient(180deg, var(--chart-primary), var(--chart-secondary))',
              }}
            />
            <span style={{ color: 'var(--text-tertiary)' }}>Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{
                background: 'linear-gradient(180deg, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 40%, transparent))',
              }}
            />
            <span style={{ color: 'var(--text-tertiary)' }}>Wochenende</span>
          </div>
        </div>
        <div style={{ color: 'var(--text-tertiary)' }}>
          Ø <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{avg.toFixed(1)}</span>/Tag
        </div>
      </div>
    </ChartCard>
  );
}
