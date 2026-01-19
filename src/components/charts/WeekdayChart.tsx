import React from 'react';
import { CalendarDays, TrendingUp } from 'lucide-react';

interface WeekdayData {
  day: string;
  val: number;
}

interface WeekdayChartProps {
  weekStats: WeekdayData[];
  maxW: number;
}

/**
 * Enhanced Weekday Distribution Chart Component
 * Shows hit distribution across days of the week with weekend highlighting
 */
export default function WeekdayChart({ weekStats, maxW }: WeekdayChartProps) {
  // Calculate total and average
  const total = weekStats.reduce((sum, s) => sum + s.val, 0);
  const avg = total / weekStats.length;

  // Find peak day
  const peakDay = weekStats.reduce((max, s) => s.val > max.val ? s : max, weekStats[0]);

  return (
    <div className="bg-gradient-to-br from-purple-900/10 to-zinc-900 border border-purple-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <CalendarDays size={16} className="text-purple-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-300 uppercase">Wochentage</h3>
            <p className="text-xs text-zinc-500">Verteilung nach Wochentag</p>
          </div>
        </div>
        {peakDay && (
          <div className="text-right">
            <div className="text-xl font-bold text-purple-400">{peakDay.day}</div>
            <div className="text-xs text-zinc-500">Top Day</div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end h-40 gap-2 mb-6" role="img" aria-label="Weekday distribution chart">
        {weekStats.map((s, idx) => {
          const heightPercent = maxW > 0 ? (s.val / maxW) * 100 : 0;
          const isWeekend = s.day === 'So' || s.day === 'Sa';
          const isPeak = peakDay && s.day === peakDay.day;
          const isAboveAvg = s.val > avg;

          return (
            <div
              key={s.day}
              className="flex-1 flex flex-col justify-end items-center gap-2 group relative"
            >
              {/* Value label on hover */}
              {s.val > 0 && (
                <div className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium mb-1">
                  {s.val}
                </div>
              )}

              {/* Above average indicator */}
              {isAboveAvg && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-60">
                  <TrendingUp size={10} className="text-purple-400"/>
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isPeak
                    ? 'bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-500/30'
                    : isWeekend
                    ? 'bg-gradient-to-t from-amber-600/60 to-amber-500/40 hover:from-amber-500 hover:to-amber-400'
                    : s.val > 0
                    ? 'bg-gradient-to-t from-purple-600/60 to-purple-500/40 hover:from-purple-500 hover:to-purple-400'
                    : 'bg-zinc-800/30'
                }`}
                style={{
                  height: `${heightPercent}%`,
                  minHeight: s.val > 0 ? '8px' : '4px',
                  animationDelay: `${idx * 0.1}s`
                }}
                role="presentation"
                aria-label={`${s.day}: ${s.val} hits`}
              />

              {/* Day label */}
              <span className={`text-[11px] uppercase font-medium ${
                isWeekend ? 'text-amber-400/80' : 'text-zinc-500'
              }`}>
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
            <div className="w-3 h-3 rounded bg-gradient-to-t from-purple-500 to-purple-400"></div>
            <span className="text-zinc-500">Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-amber-600/60 to-amber-500/40"></div>
            <span className="text-zinc-500">Wochenende</span>
          </div>
        </div>
        <div className="text-zinc-500">
          Ø <span className="text-purple-400 font-medium">{avg.toFixed(1)}</span>/Tag
        </div>
      </div>
    </div>
  );
}
