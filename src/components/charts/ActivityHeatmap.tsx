import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';

interface DayData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  heatmapData: DayData[][];
  maxHeatmapCount: number;
}

/**
 * Enhanced Activity Heatmap Component
 * GitHub-style activity heatmap for last 12 weeks with streak detection
 */
export default function ActivityHeatmap({ heatmapData, maxHeatmapCount }: ActivityHeatmapProps) {
  // Calculate peak day and current streak
  const allDays = heatmapData.flat();
  const peakDay = allDays.reduce((max, day) => day.count > max.count ? day : max, allDays[0] || { date: '', count: 0 });

  // Calculate current streak (consecutive days with activity)
  let currentStreak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalDays = allDays.filter(d => d.count > 0).length;

  return (
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border"
      style={{
        background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-success) 10%, transparent), var(--bg-secondary))',
        borderColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)' }}
          >
            <TrendingUp size={16} style={{ color: 'var(--accent-success)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-success)' }}>Aktivitäts-Heatmap</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Letzte 12 Wochen</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {currentStreak > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)' }}
            >
              <Flame size={14} style={{ color: 'var(--accent-warning)' }} />
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: 'var(--accent-warning)' }}>{currentStreak}</div>
                <div className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>Streak</div>
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>{totalDays}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Aktive Tage</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col gap-1 min-w-max" role="img" aria-label="Activity heatmap">
          {heatmapData.map((week, wi) => (
            <div key={wi} className="grid grid-rows-7 gap-1">
              {week.map((day, di) => {
                const intensity = day.count > 0 ? (day.count / maxHeatmapCount) : 0;
                const isPeak = peakDay && day.date === peakDay.date;

                return (
                  <div
                    key={di}
                    className="w-4 h-4 rounded-sm transition-all group relative cursor-pointer"
                    style={{
                      backgroundColor: day.count === 0
                        ? 'var(--bg-tertiary)'
                        : isPeak
                        ? 'var(--accent-success)'
                        : 'var(--accent-success)',
                      opacity: day.count > 0 ? 0.3 + (intensity * 0.7) : 0.3,
                      animationDelay: `${(wi * 7 + di) * 0.005}s`,
                      boxShadow: isPeak ? '0 0 0 2px color-mix(in srgb, var(--accent-success) 50%, transparent), 0 0 20px color-mix(in srgb, var(--accent-success) 30%, transparent)' : 'none',
                    }}
                    role="presentation"
                    aria-label={`${day.date}: ${day.count} hits`}
                  >
                    {/* Enhanced tooltip */}
                    <div
                      className="absolute hidden group-hover:block -top-10 left-1/2 -translate-x-1/2 backdrop-blur-sm text-white text-[9px] px-2 py-1.5 rounded-lg whitespace-nowrap z-10 border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--accent-success) 30%, transparent)',
                      }}
                    >
                      <div className="font-bold" style={{ color: 'var(--accent-success)' }}>
                        {day.count} Hit{day.count !== 1 ? 's' : ''}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {new Date(day.date).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>Weniger</span>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--accent-success)', opacity: 0.4 }}
          ></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--accent-success)', opacity: 0.7 }}
          ></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--accent-success)', opacity: 1 }}
          ></div>
          <span>Mehr</span>
        </div>
        {peakDay && peakDay.count > 0 && (
          <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            Peak: <span className="font-medium" style={{ color: 'var(--accent-success)' }}>{peakDay.count} Hits</span>
          </div>
        )}
      </div>
    </div>
  );
}
