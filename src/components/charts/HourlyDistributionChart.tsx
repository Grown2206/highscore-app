import React from 'react';
import { Clock } from 'lucide-react';

interface HourlyData {
  hour: string;
  count: number;
}

interface HourlyDistributionChartProps {
  hourlyDistribution: HourlyData[];
  maxHourlyCount: number;
}

/**
 * Enhanced Hourly Distribution Chart Component
 * Shows hit distribution across 24 hours with animations and better UX
 */
export default function HourlyDistributionChart({ hourlyDistribution, maxHourlyCount }: HourlyDistributionChartProps) {
  if (!hourlyDistribution || hourlyDistribution.length === 0) return null;

  // Find peak hour
  const peakHour = hourlyDistribution.reduce((max, h) => h.count > max.count ? h : max, hourlyDistribution[0]);

  return (
    <div className="bg-gradient-to-br from-cyan-900/10 to-zinc-900 border border-cyan-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <Clock size={16} className="text-cyan-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-cyan-300 uppercase">Stündliche Verteilung</h3>
            <p className="text-xs text-zinc-500">24-Stunden Übersicht</p>
          </div>
        </div>
        {peakHour && (
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{peakHour.hour.split(':')[0]}h</div>
            <div className="text-xs text-zinc-500">Peak Hour</div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end h-40 gap-0.5 overflow-x-auto pb-8" role="img" aria-label="Hourly distribution chart">
        {hourlyDistribution.map((h, i) => {
          const heightPercent = maxHourlyCount > 0 ? (h.count / maxHourlyCount) * 100 : 0;
          const isPeak = peakHour && h.hour === peakHour.hour;

          return (
            <div
              key={i}
              className="flex-1 min-w-[10px] flex flex-col justify-end items-center gap-1 group"
            >
              {/* Value label on hover */}
              {h.count > 0 && (
                <div className="text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  {h.count}
                </div>
              )}

              {/* Bar with gradient */}
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isPeak
                    ? 'bg-gradient-to-t from-cyan-500 to-cyan-400 shadow-lg shadow-cyan-500/30'
                    : h.count > 0
                    ? 'bg-gradient-to-t from-cyan-600/60 to-cyan-500/40 hover:from-cyan-500 hover:to-cyan-400'
                    : 'bg-zinc-800/30'
                }`}
                style={{
                  height: `${heightPercent}%`,
                  minHeight: h.count > 0 ? '4px' : '2px',
                  animationDelay: `${i * 0.02}s`
                }}
                role="presentation"
                aria-label={`${h.hour}: ${h.count} hits`}
              />

              {/* Hour label */}
              {i % 3 === 0 && (
                <span className="text-[9px] text-zinc-600 mt-1 font-medium">
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
          <div className="w-3 h-3 rounded bg-gradient-to-t from-cyan-500 to-cyan-400"></div>
          <span className="text-zinc-500">Peak Hour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-cyan-600/60 to-cyan-500/40"></div>
          <span className="text-zinc-500">Normal</span>
        </div>
      </div>
    </div>
  );
}
