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
    <div className="bg-gradient-to-br from-emerald-900/10 to-zinc-900 border border-emerald-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <TrendingUp size={16} className="text-emerald-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300 uppercase">Aktivitäts-Heatmap</h3>
            <p className="text-xs text-zinc-500">Letzte 12 Wochen</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-lg">
              <Flame size={14} className="text-orange-400"/>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-400">{currentStreak}</div>
                <div className="text-[9px] text-zinc-500">Streak</div>
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-400">{totalDays}</div>
            <div className="text-xs text-zinc-500">Aktive Tage</div>
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
                    className={`w-4 h-4 rounded-sm transition-all group relative cursor-pointer ${
                      day.count === 0
                        ? 'bg-zinc-800 hover:bg-zinc-700'
                        : isPeak
                        ? 'bg-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30'
                        : 'bg-emerald-500 hover:ring-2 hover:ring-emerald-400'
                    }`}
                    style={{
                      opacity: day.count > 0 ? 0.3 + (intensity * 0.7) : 0.3,
                      animationDelay: `${(wi * 7 + di) * 0.005}s`
                    }}
                    role="presentation"
                    aria-label={`${day.date}: ${day.count} hits`}
                  >
                    {/* Enhanced tooltip */}
                    <div className="absolute hidden group-hover:block -top-10 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-sm border border-emerald-500/30 text-white text-[9px] px-2 py-1.5 rounded-lg whitespace-nowrap z-10">
                      <div className="font-bold text-emerald-300">
                        {day.count} Hit{day.count !== 1 ? 's' : ''}
                      </div>
                      <div className="text-zinc-400">
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
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span>Weniger</span>
          <div className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 opacity-40 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 opacity-70 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 opacity-100 rounded-sm"></div>
          <span>Mehr</span>
        </div>
        {peakDay && peakDay.count > 0 && (
          <div className="text-[10px] text-zinc-500">
            Peak: <span className="text-emerald-400 font-medium">{peakDay.count} Hits</span>
          </div>
        )}
      </div>
    </div>
  );
}
