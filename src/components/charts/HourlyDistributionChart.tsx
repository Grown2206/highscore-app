import React from 'react';
import { Clock } from 'lucide-react';
import ChartCard from './ChartCard';

interface HourlyData {
  hour: string;
  count: number;
}

interface HourlyDistributionChartProps {
  hourlyDistribution: HourlyData[];
  maxHourlyCount: number;
}

/**
 * Enhanced Hourly Distribution Chart Component (v8.2 - Theme Support)
 * Shows hit distribution across 24 hours with animations and better UX
 */
export default function HourlyDistributionChart({ hourlyDistribution, maxHourlyCount }: HourlyDistributionChartProps) {
  if (!hourlyDistribution || hourlyDistribution.length === 0) return null;

  // Find peak hour
  const peakHour = hourlyDistribution.reduce((max, h) => h.count > max.count ? h : max, hourlyDistribution[0]);

  const headerRight = peakHour ? (
    <div className="text-right">
      <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
        {peakHour.hour.split(':')[0]}h
      </div>
      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Peak Hour
      </div>
    </div>
  ) : undefined;

  return (
    <ChartCard
      title="Stündliche Verteilung"
      subtitle="24-Stunden Übersicht"
      icon={Clock}
      headerRight={headerRight}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex justify-between items-end h-40 gap-0.5 overflow-x-auto pb-8" role="img" aria-label="Hourly distribution chart">
        {hourlyDistribution.map((h, i) => {
          const heightPercent = maxHourlyCount > 0 ? (h.count / maxHourlyCount) * 100 : 0;
          const isPeak = peakHour && h.hour === peakHour.hour;

          // Theme-aware bar styles
          const getBarStyle = () => {
            if (isPeak) {
              return {
                background: 'linear-gradient(180deg, var(--chart-primary), var(--chart-secondary))',
                boxShadow: 'var(--shadow-glow)',
              };
            }
            if (h.count > 0) {
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
              key={i}
              className="flex-1 min-w-[10px] flex flex-col justify-end items-center gap-1 group"
            >
              {/* Value label on hover */}
              {h.count > 0 && (
                <div
                  className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {h.count}
                </div>
              )}

              {/* Bar with gradient */}
              <div
                className="w-full rounded-t transition-all duration-300 hover:scale-105"
                style={{
                  ...getBarStyle(),
                  height: `${heightPercent}%`,
                  minHeight: h.count > 0 ? '4px' : '2px',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                }}
                role="presentation"
                aria-label={`${h.hour}: ${h.count} hits`}
              />

              {/* Hour label */}
              {i % 3 === 0 && (
                <span className="text-[9px] mt-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {h.hour.split(':')[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{
              background: 'linear-gradient(180deg, var(--chart-primary), var(--chart-secondary))',
            }}
          />
          <span style={{ color: 'var(--text-tertiary)' }}>Peak Hour</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--chart-primary) 60%, transparent), color-mix(in srgb, var(--chart-secondary) 40%, transparent))',
            }}
          />
          <span style={{ color: 'var(--text-tertiary)' }}>Normal</span>
        </div>
      </div>
    </ChartCard>
  );
}
